"""
app/routers/google_auth.py
--------------------------
Google OAuth 2.0 login for NoteFusion AI.

Flow
----
1.  Frontend redirects user to Google consent screen.
2.  Google redirects back to GET /api/v1/auth/google/callback?code=...
3.  This endpoint exchanges the code for a Google access token,
    fetches the user's profile, upserts the user in the DB,
    and returns a NoteFusion JWT that the frontend stores.

Alternatively the frontend can POST the Google id_token directly
to POST /api/v1/auth/google/token and we verify it server-side.
"""

import os
import logging
from datetime import timedelta

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash
from app.core.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------------------------------------------------------
# Google OAuth constants (non-sensitive, safe at module level)
# ---------------------------------------------------------------------------
GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO  = "https://www.googleapis.com/oauth2/v3/userinfo"


# ---------------------------------------------------------------------------
# Helper – upsert user from Google profile
# ---------------------------------------------------------------------------
async def _upsert_google_user(profile: dict, db: AsyncSession) -> User:
    """Find or create a User record from a Google profile dict."""
    email = profile.get("email", "")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account has no email address.",
        )

    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()

    if not user:
        # New user – create account (no password needed for OAuth users)
        base_username = email.split("@")[0]
        user = User(
            email=email,
            username=base_username,
            full_name=profile.get("name", ""),
            avatar_url=profile.get("picture", ""),
            hashed_password=get_password_hash(os.urandom(32).hex()),  # random pw
            is_active=True,
            is_verified=True,   # Google already verified the email
            google_id=profile.get("sub", ""),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info("Created new user via Google OAuth: %s", email)
    else:
        # Existing user – update avatar / google_id if needed
        changed = False
        if not user.google_id and profile.get("sub"):
            user.google_id = profile["sub"]
            changed = True
        if profile.get("picture") and user.avatar_url != profile["picture"]:
            user.avatar_url = profile["picture"]
            changed = True
        if changed:
            await db.commit()

    return user


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/google/login", summary="Redirect to Google consent screen")
async def google_login():
    """Redirect the browser to Google's OAuth consent page."""
    client_id = settings.GOOGLE_CLIENT_ID
    redirect_uri = settings.GOOGLE_REDIRECT_URI

    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured (GOOGLE_CLIENT_ID missing).",
        )

    params = (
        f"client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
        f"&access_type=offline"
    )
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{params}")


@router.get("/google/callback", summary="Google OAuth callback (handles the code)")
async def google_callback(
    code: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Google redirects here after user consent.
    Exchange code → access_token → user profile → NoteFusion JWT.
    """
    client_id = settings.GOOGLE_CLIENT_ID
    client_secret = settings.GOOGLE_CLIENT_SECRET
    redirect_uri = settings.GOOGLE_REDIRECT_URI

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured.",
        )

    async with httpx.AsyncClient() as client:
        # 1. Exchange authorisation code for Google tokens
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            logger.error("Google token exchange failed: %s", token_resp.text)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to exchange Google authorisation code.",
            )
        tokens = token_resp.json()
        access_token_google = tokens.get("access_token")

        # 2. Fetch user profile from Google
        profile_resp = await client.get(
            GOOGLE_USERINFO,
            headers={"Authorization": f"Bearer {access_token_google}"},
        )
        if profile_resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to fetch Google user profile.",
            )
        profile = profile_resp.json()

    # 3. Upsert user in DB
    user = await _upsert_google_user(profile, db)

    # 4. Issue NoteFusion JWT
    jwt = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    # 5. Redirect frontend with token in query param
    frontend_url = settings.FREE_DOMAIN
    return RedirectResponse(
        url=f"http://{frontend_url}/auth/google/success?token={jwt}"
    )


# ---------------------------------------------------------------------------
# POST endpoint – for frontends that send the Google id_token directly
# ---------------------------------------------------------------------------

class GoogleTokenPayload(BaseModel):
    id_token: str   # Google id_token from Firebase / GIS SDK


@router.post("/google/token", summary="Verify Google id_token and return NoteFusion JWT")
async def google_token_login(
    payload: GoogleTokenPayload,
    db: AsyncSession = Depends(get_db),
):
    """
    The frontend can POST the Google id_token here instead of using the
    redirect flow.  We verify it with Google and issue a NoteFusion JWT.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.id_token}"
        )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google id_token.",
            )
        profile = resp.json()

    # Validate audience
    if profile.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token audience mismatch.",
        )

    user = await _upsert_google_user(profile, db)

    jwt = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": jwt, "token_type": "bearer", "email": user.email}
