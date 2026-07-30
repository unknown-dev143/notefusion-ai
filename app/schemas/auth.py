"""
app/schemas/auth.py
-------------------
Pydantic schemas for authentication-related API requests & responses.
"""

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """Returned after successful login."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Claims stored inside a JWT."""
    sub: str | None = None
    action: str | None = None


class PasswordResetRequest(BaseModel):
    """Body for POST /auth/reset-request – just the user's email."""
    email: EmailStr


class PasswordReset(BaseModel):
    """Body for POST /auth/reset – token from the email + new password."""
    token: str
    new_password: str
