"""Pydantic models for payment-related schemas."""
from pydantic import BaseModel, HttpUrl
from typing import Optional

class CheckoutSessionCreate(BaseModel):
    """Schema for creating a checkout session."""
    price_id: str
    success_url: HttpUrl
    cancel_url: HttpUrl

class PortalSessionCreate(BaseModel):
    """Schema for creating a customer portal session."""
    return_url: HttpUrl

class SubscriptionTierSchema(BaseModel):
    """Schema for subscription tier information."""
    id: str
    name: str
    price_monthly: float
    price_yearly: float
    features: list[str]
    recommended: bool = False

    class Config:
        orm_mode = True

class SubscriptionStatusSchema(BaseModel):
    """Schema for subscription status information."""
    status: str
    current_period_end: Optional[int] = None
    cancel_at_period_end: Optional[bool] = None
    tier: Optional[str] = None

class PaymentMethodSchema(BaseModel):
    """Schema for payment method information."""
    id: str
    brand: str
    last4: str
    exp_month: int
    exp_year: int

class BillingHistoryItemSchema(BaseModel):
    """Schema for billing history items."""
    id: str
    date: int
    amount: int
    currency: str
    status: str
    receipt_url: Optional[str] = None
    description: Optional[str] = None
