from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base, metadata

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
    
    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    tier: SubscriptionTier = Column(SQLEnum(SubscriptionTier), default=SubscriptionTier.FREE, nullable=False)
    status: SubscriptionStatus = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.INCOMPLETE, nullable=False)
    current_period_start: Optional[datetime] = Column(DateTime, nullable=True)
    current_period_end: Optional[datetime] = Column(DateTime, nullable=True)
    cancel_at_period_end: bool = Column(Boolean, default=False, nullable=False)
    payment_method_id: Optional[str] = Column(String(255), nullable=True)
    subscription_id: Optional[str] = Column(String(255), unique=True, nullable=True)  # ID from payment provider
    subscription_metadata: Dict[str, Any] = Column(JSON, default=dict, nullable=False, name="metadata")
    created_at: datetime = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at: datetime = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user: "User" = relationship("User", back_populates="subscription")
    invoices: List["Invoice"] = relationship("Invoice", back_populates="subscription", cascade="all, delete-orphan")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id: int = Column(Integer, primary_key=True, index=True)
    subscription_id: int = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    amount: int = Column(Integer, nullable=False)  # in cents
    currency: str = Column(String(3), default="usd", nullable=False)
    invoice_id: Optional[str] = Column(String(255), unique=True, nullable=True)  # ID from payment provider
    payment_intent_id: Optional[str] = Column(String(255), nullable=True)
    status: str = Column(String(50), nullable=False)
    paid: bool = Column(Boolean, default=False, nullable=False)
    receipt_url: Optional[str] = Column(String(512), nullable=True)
    created_at: datetime = Column(DateTime, server_default=func.now(), nullable=False)
    paid_at: Optional[datetime] = Column(DateTime, nullable=True)
    
    # Relationships
    subscription: "Subscription" = relationship("Subscription", back_populates="invoices")
