"""
app/routers/password_reset.py
------------------------------
Password reset flow for NoteFusion AI.

Endpoints
---------
POST /api/v1/auth/password-reset-request
    - User sends their email.
    - We create a short-lived token (15 min) and email a reset link.
    - If email is not configured the reset link is printed to the console
      so you can test it locally without setting up SMTP.

POST /api/v1/auth/password-reset-confirm
    - User sends the token + their new password.
    - We verify the token and update the password.
"""

import os
import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    verify_token,
    get_password_hash,
)
from app.models.user import User
from app.core import token_store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth – password reset"])

# ---------------------------------------------------------------------------
# Request models (what the user sends us)
# ---------------------------------------------------------------------------

class PasswordResetRequestBody(BaseModel):
    email: EmailStr   # the user's email address


class PasswordResetConfirmBody(BaseModel):
    token: str        # the token from the email link
    new_password: str # the user's chosen new password


# ---------------------------------------------------------------------------
# Helper – send (or log) the reset email
# ---------------------------------------------------------------------------

def _dispatch_reset_email(
    to_address: str,
    reset_url: str,
    background: BackgroundTasks,
) -> None:
    """
    Try to send an email via SMTP.
    If SMTP is not configured we just print the link to the console
    so you can still test locally without setting up email.
    """
    subject = "NoteFusion – Reset your password"
    body = (
        f"Hello,\n\n"
        f"Someone requested a password reset for your NoteFusion account.\n\n"
        f"Click the link below to set a new password (valid for 15 minutes):\n\n"
        f"  {reset_url}\n\n"
        f"If you did not request this, you can safely ignore this email.\n\n"
        f"– The NoteFusion Team"
    )

    smtp_host = os.getenv("EMAIL_SMTP_HOST", "")

    if not smtp_host or smtp_host in ("localhost", ""):
        # No SMTP configured – print to console for local development
        logger.info("=== PASSWORD RESET LINK (no SMTP configured) ===")
        logger.info(f"To: {to_address}")
        logger.info(f"Reset URL: {reset_url}")
        logger.info("================================================")
        print(f"\n[NoteFusion] Password reset link for {to_address}:\n  {reset_url}\n")
        return

    # SMTP is configured – send real email in the background
    try:
        from app.utils.email import send_email_async
        send_email_async(
            to_address=to_address,
            subject=subject,
            body=body,
            background=background,
        )
    except Exception as exc:
        logger.error(f"Failed to queue reset email: {exc}")


# ---------------------------------------------------------------------------
# Endpoint 1 – Request a reset link
# ---------------------------------------------------------------------------

@router.post(
    "/password-reset-request",
    summary="Request a password reset link",
)
async def password_reset_request(
    payload: PasswordResetRequestBody,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Send a reset link to the user's email.
    We always return the same message whether the email exists or not,
    so attackers can't use this endpoint to discover which emails are registered.
    """
    user: User | None = (
        db.query(User).filter(User.email == payload.email).first()
    )

    if user:
        # Create a short-lived JWT specifically for password reset
        reset_token = create_access_token(
            data={"sub": user.email, "action": "password_reset"},
            expires_delta=timedelta(minutes=15),
        )

        # Build the reset URL
        free_domain = os.getenv("FREE_DOMAIN", "localhost:3000")
        reset_url = f"http://{free_domain}/reset-password?token={reset_token}"

        # Send (or log) the email
        _dispatch_reset_email(
            to_address=user.email,
            reset_url=reset_url,
            background=background,
        )

    return {
        "message": (
            "If that email is registered you will receive a reset link shortly."
        )
    }


# ---------------------------------------------------------------------------
# Endpoint 2 – Confirm the new password
# ---------------------------------------------------------------------------

@router.post(
    "/password-reset-confirm",
    summary="Set a new password using the reset token",
)
async def password_reset_confirm(
    payload: PasswordResetConfirmBody,
    db: Session = Depends(get_db),
):
    """
    Verify the reset token and update the user's password.
    The token expires after 15 minutes.
    """
    # Verify the JWT
    token_data = verify_token(payload.token)

    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The reset link is invalid or has expired. Please request a new one.",
        )

    if token_data.get("action") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token type.",
        )

    email = token_data.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed token.",
        )

    # Find the user
    user: User | None = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # Validate new password length
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be at least 8 characters.",
        )

    # Check the token has not already been used
    if token_store.is_revoked(payload.token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link has already been used. Please request a new one.",
        )

    # Update password
    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()

    # Revoke the token so it cannot be replayed
    token_store.revoke(payload.token, expires_in_seconds=900)

    logger.info(f"Password reset successful for user: {email}")
    return {"message": "Your password has been reset. You can now log in."}
