"""
Subscription utility functions for checking user access and feature availability.
"""
from typing import Dict, Any, Optional, List
from fastapi import Request, HTTPException, status
from sqlalchemy.orm import Session

from ..models import (
    Subscription, 
    SubscriptionTier, 
    SubscriptionStatus,
    get_subscription_features
)
from ..models.database_clean import get_db

async def get_user_subscription(user_id: int, db: Session) -> Optional[Subscription]:
    """
    Get a user's subscription, creating a free tier subscription if none exists.
    
    Args:
        user_id: The ID of the user
        db: Database session
        
    Returns:
        The user's subscription
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user_id
    ).first()
    
    # If no subscription exists, create a free tier subscription
    if not subscription:
        subscription = Subscription(
            user_id=user_id,
            tier=SubscriptionTier.FREE,
            status=SubscriptionStatus.ACTIVE
        )
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
    
    return subscription

async def check_subscription_access(
    user_id: int, 
    required_tier: Optional[SubscriptionTier] = None,
    required_features: Optional[List[str]] = None,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Check if a user has access to a feature based on their subscription.
    
    Args:
        user_id: The ID of the user
        required_tier: The minimum subscription tier required
        required_features: List of required features
        db: Optional database session (will create one if not provided)
        
    Returns:
        Dict containing:
            - has_access: bool
            - subscription: The user's subscription
            - features: The user's available features
            - message: Optional message if access is denied
    """
    if db is None:
        db = next(get_db())
    
    subscription = await get_user_subscription(user_id, db)
    features = get_subscription_features(subscription.tier)
    
    # Check subscription status
    if subscription.status != SubscriptionStatus.ACTIVE:
        return {
            "has_access": False,
            "subscription": subscription,
            "features": features,
            "message": "Your subscription is not active"
        }
    
    # Check required tier
    if required_tier and subscription.tier.value < required_tier.value:
        return {
            "has_access": False,
            "subscription": subscription,
            "features": features,
            "message": f"This feature requires {required_tier.name.capitalize()} subscription or higher"
        }
    
    # Check required features
    if required_features:
        missing_features = [
            feature for feature in required_features 
            if not features.get(feature, False)
        ]
        
        if missing_features:
            return {
                "has_access": False,
                "subscription": subscription,
                "features": features,
                "message": f"Missing required features: {', '.join(missing_features)}"
            }
    
    return {
        "has_access": True,
        "subscription": subscription,
        "features": features,
        "message": "Access granted"
    }

def subscription_required(
    required_tier: Optional[SubscriptionTier] = None,
    required_features: Optional[List[str]] = None
):
    """
    Decorator to check if a user has the required subscription level or features.
    
    Args:
        required_tier: Minimum subscription tier required
        required_features: List of required features
        
    Returns:
        Decorator function
    """
    def decorator(func):
        async def wrapper(
            request: Request, 
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db),
            *args, 
            **kwargs
        ):
            # Check subscription access
            access = await check_subscription_access(
                user_id=current_user.id,
                required_tier=required_tier,
                required_features=required_features,
                db=db
            )
            
            if not access["has_access"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=access["message"]
                )
            
            # Add subscription info to request state
            request.state.subscription = access["subscription"]
            request.state.subscription_features = access["features"]
            
            return await func(request, *args, **kwargs)
        
        return wrapper
    
    return decorator
