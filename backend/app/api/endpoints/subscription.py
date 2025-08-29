from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.models import (
    Subscription, SubscriptionTier, SubscriptionStatus, Invoice,
    get_subscription_features, get_human_readable_tier, check_feature_access
)
from app.database import get_db, SessionLocal
from app.auth import get_current_active_user, User

router = APIRouter()

# Pydantic models for request/response
class SubscriptionCreate(BaseModel):
    tier: SubscriptionTier
    payment_method_id: Optional[str] = None

class SubscriptionUpdate(BaseModel):
    tier: Optional[SubscriptionTier] = None
    status: Optional[SubscriptionStatus] = None
    cancel_at_period_end: Optional[bool] = None

class SubscriptionResponse(BaseModel):
    id: int
    tier: str
    status: str
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool
    features: Dict[str, Any]
    human_readable_tier: str

    class Config:
        orm_mode = True

class InvoiceResponse(BaseModel):
    id: int
    amount: int
    currency: str
    status: str
    paid: bool
    receipt_url: Optional[str] = None
    created_at: datetime
    paid_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Helper functions
async def get_user_subscription(user_id: int, db: Session) -> Optional[Subscription]:
    return db.query(Subscription).filter(Subscription.user_id == user_id).first()

async def create_subscription(
    user_id: int, 
    tier: SubscriptionTier, 
    db: Session,
    payment_method_id: Optional[str] = None
) -> Subscription:
    # In a real app, you would integrate with a payment provider here
    now = datetime.utcnow()
    
    subscription = Subscription(
        user_id=user_id,
        tier=tier,
        status=SubscriptionStatus.ACTIVE,
        current_period_start=now,
        current_period_end=now + timedelta(days=30),  # 30-day subscription period
        payment_method_id=payment_method_id,
        metadata={"created_at": now.isoformat()},
    )
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    return subscription

# API Endpoints
@router.post("/subscriptions/", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_user_subscription(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new subscription for the current user"""
    # Check if user already has a subscription
    existing_sub = await get_user_subscription(current_user.id, db)
    if existing_sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription"
        )
    
    # Create the subscription
    subscription = await create_subscription(
        user_id=current_user.id,
        tier=subscription_data.tier,
        db=db,
        payment_method_id=subscription_data.payment_method_id
    )
    
    # Convert to response model
    return {
        **subscription.__dict__,
        "features": get_subscription_features(subscription.tier),
        "human_readable_tier": get_human_readable_tier(subscription.tier)
    }

@router.get("/subscriptions/me", response_model=SubscriptionResponse)
async def get_my_subscription(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get the current user's subscription"""
    subscription = await get_user_subscription(current_user.id, db)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No subscription found for user"
        )
    
    return {
        **subscription.__dict__,
        "features": get_subscription_features(subscription.tier),
        "human_readable_tier": get_human_readable_tier(subscription.tier)
    }

@router.patch("/subscriptions/me", response_model=SubscriptionResponse)
async def update_my_subscription(
    subscription_data: SubscriptionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update the current user's subscription"""
    subscription = await get_user_subscription(current_user.id, db)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No subscription found for user"
        )
    
    # Update subscription fields
    if subscription_data.tier is not None:
        subscription.tier = subscription_data.tier
    if subscription_data.status is not None:
        subscription.status = subscription_data.status
    if subscription_data.cancel_at_period_end is not None:
        subscription.cancel_at_period_end = subscription_data.cancel_at_period_end
    
    subscription.updated_at = datetime.utcnow()
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    return {
        **subscription.__dict__,
        "features": get_subscription_features(subscription.tier),
        "human_readable_tier": get_human_readable_tier(subscription.tier)
    }

@router.get("/subscriptions/features", response_model=Dict[str, Any])
async def get_available_features(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all available features and their limits for the current user's subscription"""
    subscription = await get_user_subscription(current_user.id, db)
    if not subscription:
        # Return free tier features if no subscription
        return get_subscription_features(SubscriptionTier.FREE)
    
    return get_subscription_features(subscription.tier)

@router.get("/subscriptions/invoices", response_model=List[InvoiceResponse])
async def get_my_invoices(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get the current user's invoices"""
    subscription = await get_user_subscription(current_user.id, db)
    if not subscription:
        return []
    
    invoices = db.query(Invoice).filter(
        Invoice.subscription_id == subscription.id
    ).order_by(Invoice.created_at.desc()).all()
    
    return invoices
