from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from .database_clean import Base

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
    __allow_unmapped__ = True  # Allow unmapped attributes to avoid Mapped[] requirement
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    tier: Mapped[SubscriptionTier] = mapped_column(SQLEnum(SubscriptionTier), default=SubscriptionTier.FREE, nullable=False)
    status: Mapped[SubscriptionStatus] = mapped_column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.INCOMPLETE, nullable=False)
    current_period_start: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    current_period_end: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    payment_method_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    subscription_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)  # ID from payment provider
    subscription_metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, name="metadata", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        server_default=func.now(), 
        onupdate=func.now(),
        nullable=False
    )
    
    # Relationships
    user: Mapped[Any] = relationship("User", back_populates="subscription")
    invoices: Mapped[List["Invoice"]] = relationship("Invoice", back_populates="invoices", cascade="all, delete-orphan")

class Invoice(Base):
    __tablename__ = "invoices"
    __allow_unmapped__ = True  # Allow unmapped attributes to avoid Mapped[] requirement
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    subscription_id: Mapped[int] = mapped_column(ForeignKey("subscriptions.id"), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # in cents
    currency: Mapped[str] = mapped_column(String(3), default="usd", nullable=False)
    invoice_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    payment_intent_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    paid: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    receipt_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    subscription: Mapped[Any] = relationship("Subscription", back_populates="invoices")

# Update the User model to include subscription relationship
from .user_clean import User as UserModel
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
