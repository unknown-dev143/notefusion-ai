"""
app/routers/auth.py
-------------------
Authentication endpoints for NoteFusion AI.

Endpoints
---------
POST /api/v1/auth/login
    Standard OAuth2 password-flow login. Returns a bearer token.

POST /api/v1/auth/reset-request
    Request a password-reset email (rate-limited to 5 req/minute).

POST /api/v1/auth/reset
    Confirm a password reset using the token from the email.

POST /api/v1/auth/verify-email
    Request an email-verification link.

Note: For Firebase-backed authentication the frontend handles token
issuance directly; these endpoints are used by the backend-only flow.
"""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    verify_token,
    verify_password,
    get_password_hash,
)
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import Token, PasswordResetRequest, PasswordReset
from app.utils.email import send_email_async

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """OAuth2 password-flow login. Returns a JWT bearer token."""
    result = await db.execute(select(User).filter(User.email == form_data.username))
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ---------------------------------------------------------------------------
# Password reset – request
# ---------------------------------------------------------------------------

@router.post("/reset-request", summary="Request a password-reset link (5 req/min)")
async def reset_request(
    request: Request,
    payload: PasswordResetRequest,
    background: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Send a reset link to the user's email. Always returns the same message
    to avoid leaking which emails are registered."""
    result = await db.execute(select(User).filter(User.email == payload.email))
    user = result.scalars().first()

    if user:
        reset_token = create_access_token(
            data={"sub": user.email, "action": "reset"},
            expires_delta=timedelta(minutes=15),
        )
        reset_url = f"{settings.FRONTEND_RESET_URL}?token={reset_token}"
        send_email_async(
            to_address=user.email,
            subject="NoteFusion – Password Reset",
            body=f"Click to reset your password (valid 15 min):\n\n{reset_url}",
            background=background,
        )

    return {"msg": "If that email is registered you will receive a reset link shortly."}


# ---------------------------------------------------------------------------
# Password reset – confirm
# ---------------------------------------------------------------------------

@router.post("/reset", summary="Set a new password using the reset token")
async def reset_password(
    request: Request,
    payload: PasswordReset,
    db: AsyncSession = Depends(get_db),
):
    """Verify the reset token and update the password."""
    from app.core import token_store  # local import avoids circular deps

    token_data = verify_token(payload.token)
    if not token_data or token_data.get("action") != "reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )

    if token_store.is_revoked(payload.token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link has already been used. Please request a new one.",
        )

    email = token_data.get("sub")
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters",
        )

    user.hashed_password = get_password_hash(payload.new_password)
    await db.commit()

    token_store.revoke(payload.token, expires_in_seconds=900)
    return {"msg": "Password has been reset. You can now log in."}


# ---------------------------------------------------------------------------
# Email verification – request
# ---------------------------------------------------------------------------

@router.post("/verify-email", summary="Request an email-verification link")
async def request_verify_email(
    request: Request,
    payload: PasswordResetRequest,
    background: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Send an email-verification link. Always returns the same message."""
    result = await db.execute(select(User).filter(User.email == payload.email))
    user = result.scalars().first()

    if user and not user.is_verified:
        verify_tok = create_access_token(
            data={"sub": user.email, "action": "verify"},
            expires_delta=timedelta(hours=24),
        )
        verify_url = f"{settings.FRONTEND_VERIFY_URL}?token={verify_tok}"
        send_email_async(
            to_address=user.email,
            subject="NoteFusion – Verify your email",
            body=f"Click to verify your email (valid 24 h):\n\n{verify_url}",
            background=background,
        )

    return {"msg": "If that email is registered and unverified you will receive a verification link."}
