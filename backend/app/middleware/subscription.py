from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Callable, Awaitable, List, Optional

from app.database import get_db
from app.models import Subscription, SubscriptionStatus, SubscriptionTier, get_subscription_features
from app.auth import get_current_user

class SubscriptionChecker:
    def __init__(
        self,
        required_tier: Optional[SubscriptionTier] = None,
        required_features: Optional[List[str]] = None,
        allow_trial: bool = True
    ):
        self.required_tier = required_tier
        self.required_features = required_features or []
        self.allow_trial = allow_trial

    async def __call__(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[JSONResponse]]
    ) -> JSONResponse:
        # Skip for public routes
        if request.url.path in [
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/subscriptions/plans",
            "/docs",
            "/openapi.json"
        ]:
            return await call_next(request)

        # Get current user
        current_user = await get_current_user(request)
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )

        # Get user's subscription
        db: Session = next(get_db())
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id
        ).first()

        # If no subscription, assign free tier
        if not subscription:
            subscription = Subscription(
                user_id=current_user.id,
                tier=SubscriptionTier.FREE,
                status=SubscriptionStatus.ACTIVE
            )
            db.add(subscription)
            db.commit()
            db.refresh(subscription)

        # Check subscription status
        if subscription.status != SubscriptionStatus.ACTIVE and not (
            self.allow_trial and subscription.status == SubscriptionStatus.TRIALING
        ):
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Subscription is not active"
            )

        # Check required tier
        if self.required_tier and subscription.tier.value < self.required_tier.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires {self.required_tier.value.capitalize()} subscription or higher"
            )

        # Check required features
        features = get_subscription_features(subscription.tier)
        for feature in self.required_features:
            if not features.get(feature, False):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Feature '{feature}' is not available in your subscription"
                )

        # Add subscription to request state for use in route handlers
        request.state.subscription = subscription
        request.state.subscription_features = features

        return await call_next(request)

# Middleware instances for different access levels
subscription_required = SubscriptionChecker(
    required_tier=SubscriptionTier.PRO
)

business_subscription_required = SubscriptionChecker(
    required_tier=SubscriptionTier.BUSINESS
)

def feature_required(*features: str):
    """Decorator to check for specific features in the user's subscription"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            request = kwargs.get('request')
            if not hasattr(request.state, 'subscription_features'):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Subscription features not found in request state"
                )
            
            subscription_features = request.state.subscription_features
            for feature in features:
                if not subscription_features.get(feature, False):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Feature '{feature}' is not available in your subscription"
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
