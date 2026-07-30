"""
app/routers/payments.py
------------------------
Stripe payment integration for NoteFusion AI.

Endpoints
---------
POST /api/v1/payments/create-checkout-session
    Creates a Stripe Checkout Session for a token bundle purchase.
    Returns { session_id, url } — the frontend redirects the user to `url`.

POST /api/v1/payments/webhook
    Stripe calls this endpoint after a successful payment.
    We verify the Stripe signature and credit tokens to the user.

GET  /api/v1/payments/plans
    Returns the available token bundle plans (no auth required).
"""

import os
import logging
from typing import Optional

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configure Stripe – uses the key from .env
# ---------------------------------------------------------------------------
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

router = APIRouter(prefix="/payments", tags=["payments"])

# ---------------------------------------------------------------------------
# Token bundle definitions (mirrors the frontend Payment.tsx bundles)
# ---------------------------------------------------------------------------
PLANS = [
    {
        "id": "starter",
        "name": "Lite Scholar",
        "tokens": 100,
        "price_cents": 499,          # $4.99
        "currency": "usd",
        "description": "100 Scholar Tokens",
    },
    {
        "id": "pro",
        "name": "Master Scholar",
        "tokens": 550,               # 500 + 50 bonus
        "price_cents": 1499,         # $14.99
        "currency": "usd",
        "description": "550 Scholar Tokens (500 + 50 bonus)",
    },
    {
        "id": "unlimited",
        "name": "Apex Scholar",
        "tokens": 2200,              # 2000 + 200 bonus
        "price_cents": 3999,         # $39.99
        "currency": "usd",
        "description": "2200 Scholar Tokens (2000 + 200 bonus)",
    },
]

PLAN_MAP = {p["id"]: p for p in PLANS}


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class CheckoutRequest(BaseModel):
    plan_id: str    # one of: "starter", "pro", "unlimited"
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/plans", summary="List available token bundle plans")
async def get_plans():
    """Returns all available payment plans. No authentication required."""
    return {"plans": PLANS}


@router.post("/create-checkout-session", summary="Start a Stripe payment session")
async def create_checkout_session(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_active_user),
):
    """
    Creates a Stripe Checkout Session.
    The frontend should redirect the user to the returned `url`.
    """
    if not stripe.api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment system is not configured (STRIPE_SECRET_KEY missing).",
        )

    plan = PLAN_MAP.get(body.plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown plan '{body.plan_id}'. Choose from: {list(PLAN_MAP.keys())}",
        )

    free_domain = os.getenv("FREE_DOMAIN", "localhost:3000")
    success_url = body.success_url or f"http://{free_domain}/payment/success?plan={plan['id']}"
    cancel_url = body.cancel_url or f"http://{free_domain}/payment"

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            customer_email=current_user.email,
            client_reference_id=str(current_user.id),
            metadata={
                "user_id": str(current_user.id),
                "plan_id": plan["id"],
                "tokens": str(plan["tokens"]),
            },
            line_items=[
                {
                    "price_data": {
                        "currency": plan["currency"],
                        "product_data": {
                            "name": plan["name"],
                            "description": plan["description"],
                        },
                        "unit_amount": plan["price_cents"],
                    },
                    "quantity": 1,
                }
            ],
            success_url=success_url,
            cancel_url=cancel_url,
        )
        return {"session_id": session.id, "url": session.url}

    except stripe.StripeError as exc:
        logger.error(f"Stripe error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Stripe error: {str(exc)}",
        )


@router.post("/webhook", summary="Stripe webhook (called by Stripe after payment)")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Stripe sends a POST here after a successful payment.
    We verify the signature and credit tokens to the user's account.

    To test locally:
        stripe listen --forward-to localhost:8000/api/v1/payments/webhook
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    # Verify the webhook came from Stripe
    if STRIPE_WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
        except (stripe.SignatureVerificationError, ValueError) as exc:
            logger.warning(f"Invalid Stripe webhook signature: {exc}")
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
    else:
        # No webhook secret configured – parse without verification (dev only)
        import json
        event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)

    # Handle successful payment
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = int(session.get("client_reference_id", 0) or 0)
        tokens = int(session.get("metadata", {}).get("tokens", 0))
        plan_id = session.get("metadata", {}).get("plan_id", "unknown")

        logger.info(f"Payment success: user_id={user_id}, tokens={tokens}, plan={plan_id}")

        if user_id and tokens:
            from sqlalchemy import select
            result = await db.execute(select(User).filter(User.id == user_id))
            user = result.scalars().first()
            if user:
                user.token_balance = (user.token_balance or 0) + tokens
                await db.commit()
                logger.info(
                    f"Credited {tokens} Scholar Tokens to user {user_id}. "
                    f"New balance: {user.token_balance}"
                )
            else:
                logger.warning(f"Stripe webhook: user_id={user_id} not found in DB")

    return {"status": "ok"}
