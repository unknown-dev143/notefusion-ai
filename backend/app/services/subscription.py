"""
Subscription service for handling subscription-related business logic.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..models import Subscription, Invoice, SubscriptionTier, SubscriptionStatus, get_subscription_features
from ..schemas.subscription import SubscriptionCreate, SubscriptionUpdate, InvoiceCreate, SubscriptionPlan
from ..models.database_clean import get_db

logger = logging.getLogger(__name__)

# Subscription plans configuration
SUBSCRIPTION_PLANS = {
    "free": {
        "id": "free",
        "name": "Free",
        "description": "Basic features for getting started",
        "price": 0,
        "currency": "usd",
        "interval": "month",
        "features": [
            "120 minutes of transcription/month",
            "10 AI summaries",
            "Basic integrations",
            "Community support"
        ],
        "is_popular": False
    },
    "pro_monthly": {
        "id": "pro_monthly",
        "name": "Pro (Monthly)",
        "description": "For professionals who need more power",
        "price": 1500,  # $15/month
        "currency": "usd",
        "interval": "month",
        "features": [
            "1,800 minutes of transcription/month",
            "100+ AI summaries",
            "Export to multiple formats",
            "Advanced integrations",
            "Priority support"
        ],
        "is_popular": True
    },
    "pro_yearly": {
        "id": "pro_yearly",
        "name": "Pro (Yearly)",
        "description": "Best value - save 17%",
        "price": 15000,  # $150/year ($12.50/month)
        "currency": "usd",
        "interval": "year",
        "features": [
            "1,800 minutes of transcription/month",
            "100+ AI summaries",
            "Export to multiple formats",
            "Advanced integrations",
            "Priority support",
            "2 months free compared to monthly"
        ],
        "is_popular": False
    },
    "business_monthly": {
        "id": "business_monthly",
        "name": "Business (Monthly)",
        "description": "For teams and businesses",
        "price": 3000,  # $30/user/month
        "currency": "usd",
        "interval": "month",
        "features": [
            "Unlimited transcription",
            "Unlimited AI summaries",
            "All export formats",
            "All integrations",
            "Admin dashboard",
            "Team management",
            "Priority support"
        ],
        "is_popular": False
    },
    "business_yearly": {
        "id": "business_yearly",
        "name": "Business (Yearly)",
        "description": "Best for teams - save 17%",
        "price": 30000,  # $300/user/year ($25/user/month)
        "currency": "usd",
        "interval": "year",
        "features": [
            "Unlimited transcription",
            "Unlimited AI summaries",
            "All export formats",
            "All integrations",
            "Admin dashboard",
            "Team management",
            "Priority support",
            "2 months free compared to monthly"
        ],
        "is_popular": False
    }
}

# Map plan IDs to subscription tiers
PLAN_TO_TIER = {
    "free": SubscriptionTier.FREE,
    "pro_monthly": SubscriptionTier.PRO,
    "pro_yearly": SubscriptionTier.PRO,
    "business_monthly": SubscriptionTier.BUSINESS,
    "business_yearly": SubscriptionTier.BUSINESS
}

class SubscriptionService:
    """Service for handling subscription-related operations."""
    
    @staticmethod
    def get_subscription_plans() -> List[Dict[str, Any]]:
        """Get all available subscription plans."""
        return list(SUBSCRIPTION_PLANS.values())
    
    @staticmethod
    def get_plan(plan_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific subscription plan by ID."""
        return SUBSCRIPTION_PLANS.get(plan_id)
    
    @staticmethod
    def create_subscription(
        db: Session,
        user_id: int,
        subscription_data: SubscriptionCreate,
        payment_method_id: Optional[str] = None
    ) -> Subscription:
        """Create a new subscription for a user."""
        try:
            # Check if user already has a subscription
            existing_sub = db.query(Subscription).filter(
                Subscription.user_id == user_id
            ).first()
            
            if existing_sub:
                raise ValueError("User already has a subscription")
            
            # Create new subscription
            subscription = Subscription(
                user_id=user_id,
                tier=subscription_data.tier,
                status=SubscriptionStatus.ACTIVE,
                current_period_start=datetime.utcnow(),
                current_period_end=datetime.utcnow() + timedelta(days=30),  # Default to 30 days
                cancel_at_period_end=False,
                payment_method_id=payment_method_id,
                metadata={
                    "created_at": datetime.utcnow().isoformat(),
                    "trial_days": subscription_data.trial_period_days or 0
                }
            )
            
            db.add(subscription)
            db.commit()
            db.refresh(subscription)
            
            return subscription
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error creating subscription: {str(e)}")
            raise
    
    @staticmethod
    def update_subscription(
        db: Session,
        subscription_id: int,
        update_data: SubscriptionUpdate
    ) -> Optional[Subscription]:
        """Update an existing subscription."""
        try:
            subscription = db.query(Subscription).filter(
                Subscription.id == subscription_id
            ).first()
            
            if not subscription:
                return None
            
            # Update subscription fields
            for field, value in update_data.dict(exclude_unset=True).items():
                if hasattr(subscription, field):
                    setattr(subscription, field, value)
            
            subscription.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(subscription)
            
            return subscription
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error updating subscription: {str(e)}")
            raise
    
    @staticmethod
    def cancel_subscription(
        db: Session,
        subscription_id: int,
        cancel_at_period_end: bool = True
    ) -> Optional[Subscription]:
        """Cancel a subscription."""
        try:
            subscription = db.query(Subscription).filter(
                Subscription.id == subscription_id
            ).first()
            
            if not subscription:
                return None
            
            if cancel_at_period_end:
                # Schedule cancellation at period end
                subscription.cancel_at_period_end = True
                subscription.status = SubscriptionStatus.ACTIVE
            else:
                # Cancel immediately
                subscription.status = SubscriptionStatus.CANCELED
                subscription.current_period_end = datetime.utcnow()
            
            subscription.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(subscription)
            
            return subscription
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error canceling subscription: {str(e)}")
            raise
    
    @staticmethod
    def create_invoice(
        db: Session,
        subscription_id: int,
        invoice_data: InvoiceCreate
    ) -> Invoice:
        """Create a new invoice for a subscription."""
        try:
            invoice = Invoice(
                subscription_id=subscription_id,
                amount=invoice_data.amount,
                currency=invoice_data.currency,
                status=invoice_data.status,
                paid=invoice_data.paid,
                receipt_url=invoice_data.receipt_url,
                payment_intent_id=invoice_data.payment_intent_id
            )
            
            db.add(invoice)
            db.commit()
            db.refresh(invoice)
            
            return invoice
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error creating invoice: {str(e)}")
            raise
    
    @staticmethod
    def get_user_subscription(
        db: Session,
        user_id: int
    ) -> Optional[Subscription]:
        """Get a user's subscription."""
        return db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).first()
    
    @staticmethod
    def get_subscription_invoices(
        db: Session,
        subscription_id: int,
        limit: int = 10,
        offset: int = 0
    ) -> List[Invoice]:
        """Get invoices for a subscription."""
        return db.query(Invoice).filter(
            Invoice.subscription_id == subscription_id
        ).order_by(Invoice.created_at.desc()).offset(offset).limit(limit).all()
    
    @staticmethod
    def get_subscription_features(subscription: Subscription) -> Dict[str, Any]:
        """Get features available for a subscription."""
        return get_subscription_features(subscription.tier)
    
    @staticmethod
    def check_feature_access(
        subscription: Subscription,
        feature: str,
        value: Any = None
    ) -> bool:
        """Check if a subscription has access to a specific feature."""
        features = get_subscription_features(subscription.tier)
        
        if feature not in features:
            return False
        
        if value is not None:
            return features[feature] >= value
        
        return bool(features[feature])
