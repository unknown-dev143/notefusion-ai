from datetime import datetime
from enum import Enum
from typing import Any, Dict
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from .database import Base

class SubscriptionTier(str, Enum):
    FREE = "free"
    PRO = "pro"
    BUSINESS = "business"
    ADMIN = "admin"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    UNPAID = "unpaid"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired"
    PAUSED = "paused"

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    tier = Column(SQLEnum(SubscriptionTier), default=SubscriptionTier.FREE, nullable=False)
    status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionTier.FREE, nullable=False)
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    payment_method_id = Column(String, nullable=True)
    subscription_id = Column(String, unique=True, nullable=True)  # ID from payment provider
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="subscription")
    invoices = relationship("Invoice", back_populates="subscription")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # in cents
    currency = Column(String, default="usd")
    invoice_id = Column(String, unique=True, nullable=True)  # ID from payment provider
    payment_intent_id = Column(String, nullable=True)
    status = Column(String, nullable=False)
    paid = Column(Boolean, default=False)
    receipt_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)
    
    # Relationships
    subscription = relationship("Subscription", back_populates="invoices")

# Update the User model to include subscription relationship
from .user import User as UserModel
UserModel.subscription = relationship("Subscription", back_populates="user", uselist=False)

# Subscription features and limits
SUBSCRIPTION_FEATURES = {
    SubscriptionTier.FREE: {
        "monthly_minutes": 120,
        "ai_summaries": 10,
        "export_formats": ["txt"],
        "max_file_size_mb": 25,
        "integrations": ["zoom", "google_meet"],
        "priority_support": False,
        "ads_enabled": True,
        "admin_dashboard": False,
        "sso": False,
        "usage_analytics": False,
    },
    SubscriptionTier.PRO: {
        "monthly_minutes": 1800,
        "ai_summaries": 100,
        "export_formats": ["txt", "pdf", "docx"],
        "max_file_size_mb": 100,
        "integrations": ["zoom", "google_meet", "notion", "slack"],
        "priority_support": True,
        "ads_enabled": False,
        "admin_dashboard": False,
        "sso": False,
        "usage_analytics": False,
    },
    SubscriptionTier.BUSINESS: {
        "monthly_minutes": float('inf'),  # Unlimited
        "ai_summaries": float('inf'),    # Unlimited
        "export_formats": ["txt", "pdf", "docx", "srt", "vtt"],
        "max_file_size_mb": 500,
        "integrations": ["zoom", "google_meet", "notion", "slack", "salesforce", "zapier"],
        "priority_support": True,
        "ads_enabled": False,
        "admin_dashboard": True,
        "sso": True,
        "usage_analytics": True,
    },
    SubscriptionTier.ADMIN: {
        "monthly_minutes": float('inf'),
        "ai_summaries": float('inf'),
        "export_formats": ["txt", "pdf", "docx", "srt", "vtt", "csv"],
        "max_file_size_mb": 1000,
        "integrations": "all",
        "priority_support": True,
        "ads_enabled": False,
        "admin_dashboard": True,
        "sso": True,
        "usage_analytics": True,
        "all_features": True,
    }
}

def get_subscription_features(tier: SubscriptionTier) -> dict:
    """
    Get the feature set for a given subscription tier.
    
    Args:
        tier: The subscription tier
        
    Returns:
        Dict containing the features for the tier
    """
    return SUBSCRIPTION_FEATURES.get(tier, SUBSCRIPTION_FEATURES[SubscriptionTier.FREE])

async def check_feature_access(
    user_subscription: 'Subscription',
    feature: str,
    value: Any = None
) -> bool:
    """
    Check if a user has access to a specific feature based on their subscription.
    
    Args:
        user_subscription: The user's subscription object
        feature: The feature to check access for
        value: Optional value to compare against the feature limit
        
    Returns:
        bool: True if the user has access, False otherwise
    """
    if not user_subscription:
        return False
        
    features = get_subscription_features(user_subscription.tier)
    
    # Check if the feature exists
    if feature not in features:
        return False
    
    # If no value is provided, just check if the feature is enabled
    if value is None:
        return bool(features[feature])
    
    # If the feature is a list, check if the value is in the list
    if isinstance(features[feature], list):
        return value in features[feature]
    
    # If the feature is a limit, check if the value is within the limit
    if isinstance(features[feature], (int, float)) and isinstance(value, (int, float)):
        return value <= features[feature]
    
    # For boolean features
    return bool(features[feature])

def get_human_readable_tier(tier: SubscriptionTier) -> str:
    """
    Convert a subscription tier to a human-readable string.
    
    Args:
        tier: The subscription tier
        
    Returns:
        str: Human-readable tier name
    """
    return {
        SubscriptionTier.FREE: "Free",
        SubscriptionTier.PRO: "Pro",
        SubscriptionTier.BUSINESS: "Business",
        SubscriptionTier.ADMIN: "Admin"
    }.get(tier, "Free")
