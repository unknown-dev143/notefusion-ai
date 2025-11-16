"""Payment-related API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.payment import CheckoutSessionCreate, PortalSessionCreate
from app.services.payment_service import PaymentService

router = APIRouter()

@router.post("/create-checkout-session", response_model=Dict[str, Any])
async def create_checkout_session(
    checkout_data: CheckoutSessionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new Stripe Checkout session."""
    try:
        session = PaymentService.create_checkout_session(
            user=current_user,
            price_id=checkout_data.price_id,
            success_url=checkout_data.success_url,
            cancel_url=checkout_data.cancel_url
        )
        return session
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/create-portal-session", response_model=Dict[str, Any])
async def create_portal_session(
    portal_data: PortalSessionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe Customer Portal session."""
    try:
        session = PaymentService.create_portal_session(
            user=current_user,
            return_url=portal_data.return_url
        )
        return session
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/webhook", include_in_schema=False)
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    if not sig_header:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Missing Stripe signature"}
        )
    
    try:
        result = PaymentService.handle_webhook_event(
            payload=payload,
            signature=sig_header,
            db=db
        )
        return JSONResponse(status_code=200, content=result)
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"error": e.detail}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": str(e)}
        )
