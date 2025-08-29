from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import SubscriptionTier, SubscriptionStatus
from app.utils.subscription import get_user_subscription, check_subscription_access
from app.auth import get_current_user

router = APIRouter(tags=["subscription-test"])

@router.get("/test/subscription/check")
async def test_subscription_check(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Test endpoint to check subscription status and features.
    """
    # Get or create user's subscription
    subscription = await get_user_subscription(current_user.id, db)
    
    # Get available features
    features = {
        "monthly_minutes": "120 minutes",
        "ai_summaries": "10 summaries",
        "export_formats": ["txt"],
        "max_file_size_mb": 25,
        "integrations": ["zoom", "google_meet"],
        "priority_support": False,
        "ads_enabled": True
    }
    
    if subscription.tier == SubscriptionTier.PRO:
        features = {
            "monthly_minutes": "1,800 minutes",
            "ai_summaries": "100+ summaries",
            "export_formats": ["txt", "pdf", "docx"],
            "max_file_size_mb": 100,
            "integrations": ["zoom", "google_meet", "notion", "slack"],
            "priority_support": True,
            "ads_enabled": False
        }
    elif subscription.tier == SubscriptionTier.BUSINESS:
        features = {
            "monthly_minutes": "Unlimited",
            "ai_summaries": "Unlimited",
            "export_formats": ["txt", "pdf", "docx", "srt", "vtt"],
            "max_file_size_mb": 500,
            "integrations": ["zoom", "google_meet", "notion", "slack", "salesforce", "zapier"],
            "priority_support": True,
            "ads_enabled": False,
            "admin_dashboard": True,
            "sso": True,
            "usage_analytics": True
        }
    elif subscription.tier == SubscriptionTier.ADMIN:
        features = {
            "monthly_minutes": "Unlimited",
            "ai_summaries": "Unlimited",
            "export_formats": ["txt", "pdf", "docx", "srt", "vtt", "csv"],
            "max_file_size_mb": 1000,
            "integrations": "All integrations",
            "priority_support": True,
            "ads_enabled": False,
            "admin_dashboard": True,
            "sso": True,
            "usage_analytics": True,
            "all_features": True
        }
    
    return {
        "user_id": current_user.id,
        "subscription": {
            "tier": subscription.tier.value,
            "status": subscription.status.value,
            "current_period_start": subscription.current_period_start,
            "current_period_end": subscription.current_period_end,
            "cancel_at_period_end": subscription.cancel_at_period_end
        },
        "features": features
    }

@router.get("/test/subscription/required")
async def test_subscription_required(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Test endpoint that requires a paid subscription.
    """
    # Check if user has at least a PRO subscription
    access = await check_subscription_access(
        user_id=current_user.id,
        required_tier=SubscriptionTier.PRO,
        db=db
    )
    
    if not access["has_access"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=access["message"]
        )
    
    return {
        "message": "Welcome, PRO user!",
        "subscription": {
            "tier": access["subscription"].tier.value,
            "status": access["subscription"].status.value
        },
        "features": access["features"]
    }
