"""Pydantic models for subscription-related schemas."""
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, validator

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

class SubscriptionBase(BaseModel):
    tier: SubscriptionTier = Field(..., description="Subscription tier")
    status: SubscriptionStatus = Field(..., description="Subscription status")
    current_period_start: Optional[datetime] = Field(None, description="Start of the current billing period")
    current_period_end: Optional[datetime] = Field(None, description="End of the current billing period")
    cancel_at_period_end: bool = Field(False, description="Whether the subscription will be canceled at the end of the billing period")

class SubscriptionCreate(SubscriptionBase):
    payment_method_id: Optional[str] = Field(None, description="ID of the payment method to use for this subscription")
    trial_period_days: Optional[int] = Field(None, description="Number of days for the trial period")

class SubscriptionUpdate(BaseModel):
    tier: Optional[SubscriptionTier] = Field(None, description="New subscription tier")
    status: Optional[SubscriptionStatus] = Field(None, description="New subscription status")
    cancel_at_period_end: Optional[bool] = Field(None, description="Whether to cancel the subscription at the end of the billing period")
    payment_method_id: Optional[str] = Field(None, description="New payment method ID to use for this subscription")

class SubscriptionInDB(SubscriptionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = {}

    class Config:
        orm_mode = True

class InvoiceBase(BaseModel):
    amount: int = Field(..., description="Amount in the smallest currency unit (e.g., cents)")
    currency: str = Field("usd", description="Three-letter ISO currency code")
    status: str = Field(..., description="Invoice status")
    paid: bool = Field(False, description="Whether the invoice has been paid")
    receipt_url: Optional[str] = Field(None, description="URL to view the invoice")

class InvoiceCreate(InvoiceBase):
    subscription_id: int = Field(..., description="ID of the subscription this invoice is for")
    payment_intent_id: Optional[str] = Field(None, description="ID of the payment intent for this invoice")

class InvoiceInDB(InvoiceBase):
    id: int
    subscription_id: int
    created_at: datetime
    paid_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class SubscriptionWithInvoices(SubscriptionInDB):
    invoices: List[InvoiceInDB] = []

class SubscriptionPlan(BaseModel):
    id: str = Field(..., description="Plan ID")
    name: str = Field(..., description="Plan name")
    description: str = Field(..., description="Plan description")
    price: int = Field(..., description="Price in the smallest currency unit (e.g., cents)")
    currency: str = Field("usd", description="Three-letter ISO currency code")
    interval: str = Field(..., description="Billing interval (e.g., 'month' or 'year')")
    features: List[str] = Field(..., description="List of features included in this plan")
    is_popular: bool = Field(False, description="Whether this is a featured/popular plan")

class SubscriptionFeatures(BaseModel):
    tier: SubscriptionTier = Field(..., description="Subscription tier")
    features: Dict[str, Any] = Field(..., description="Dictionary of features and their values")

class SubscriptionStatusResponse(BaseModel):
    has_access: bool = Field(..., description="Whether the user has access to the requested feature")
    message: str = Field(..., description="Explanation of the access status")
    subscription: Optional[SubscriptionInDB] = Field(None, description="User's subscription details")
    features: Dict[str, Any] = Field(default_factory=dict, description="Available features for the user's subscription")
