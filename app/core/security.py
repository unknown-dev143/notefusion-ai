import os
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Union, List

from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError, JWTClaimsError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from fastapi.security.utils import get_authorization_scheme_param
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserInDB, UserRole
from app.core.logging import logger
from app.core.config import settings

# Security configurations
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = getattr(settings, "ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
TOKEN_TYPE = "bearer"

# Password hashing configuration
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/token",
    scopes={
        "me": "Read information about the current user.",
        "notes:read": "Read notes.",
        "notes:write": "Create and update notes.",
        "admin": "Admin operations.",
    },
)

# Rate limiting store
_rate_limit_store = {}


def get_rate_limit_key(client_ip: str, endpoint: str) -> str:
    return f"rate_limit:{client_ip}:{endpoint}"


def check_rate_limit(request: Request, limit: int = 60, window: int = 60) -> bool:
    client_ip = request.client.host
    endpoint = request.url.path
    key = get_rate_limit_key(client_ip, endpoint)
    current_time = time.time()
    window_start = current_time - window
    _rate_limit_store[key] = [
        t for t in _rate_limit_store.get(key, []) if t > window_start
    ]
    if len(_rate_limit_store.get(key, [])) >= limit:
        return False
    if key not in _rate_limit_store:
        _rate_limit_store[key] = []
    _rate_limit_store[key].append(current_time)
    return True


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return {} # Return empty on error to allow demo mode fallback


async def authenticate_user(
    db: AsyncSession, username: str, password: str, request: Optional[Request] = None
) -> Optional[User]:
    if not username or not password:
        return None
    try:
        from sqlalchemy import select, or_

        result = await db.execute(
            select(User).filter(or_(User.username == username, User.email == username))
        )
        user = result.scalars().first()
        if not user:
            return None
        if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
            lockout_time = user.last_failed_login + timedelta(
                minutes=settings.LOGIN_LOCKOUT_MINUTES
            )
            if datetime.utcnow() < lockout_time:
                return None
            else:
                user.failed_login_attempts = 0
                await db.commit()
        if not verify_password(password, user.hashed_password):
            user.failed_login_attempts += 1
            user.last_failed_login = datetime.utcnow()
            await db.commit()
            return None
        if user.failed_login_attempts > 0:
            user.failed_login_attempts = 0
            await db.commit()
        return user
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        return None


async def get_current_user(
    security_scopes: SecurityScopes,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    # Extract token manually to avoid strict 401 from oauth2_scheme
    auth_header = request.headers.get("Authorization")
    scheme, token = get_authorization_scheme_param(auth_header)
    
    if not auth_header or scheme.lower() != "bearer" or not token:
        return None
    try:
        payload = verify_token(token)
        if payload.get("type") != "access":
            return None
        user_id = payload.get("sub")
        if user_id is None:
            return None

        # User ID might be username or ID
        from sqlalchemy import select

        result = await db.execute(select(User).filter(User.username == user_id))
        user = result.scalars().first()
        if not user:
            # Try by ID
            try:
                user_id_int = int(user_id)
                result = await db.execute(select(User).filter(User.id == user_id_int))
                user = result.scalars().first()
            except ValueError:
                pass

        if user is None:
            return None

        if security_scopes.scopes:
            token_scopes = payload.get("scopes", [])
            for scope in security_scopes.scopes:
                if scope not in token_scopes:
                    return None
        return user
    except Exception:
        return None


async def get_current_active_user(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    if current_user:
        if not current_user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        return current_user
        
    # Demo Mode Override: If no user is authenticated, return a default 'Demo' user
    # This aligns with the frontend's 'open access' architecture for rapid exploration
    from sqlalchemy import select
    result = await db.execute(select(User).filter(User.id == 1))
    demo_user = result.scalars().first()
    
    if not demo_user:
        # Create a default demo user if not exists
        demo_user = User(
            id=1,
            email="demo@notefusion.ai",
            username="scholar",
            hashed_password=get_password_hash("demo123"),
            full_name="Neural Scholar",
            is_active=True,
            is_verified=True,
            role=UserRole.USER
        )
        db.add(demo_user)
        await db.commit()
        await db.refresh(demo_user)
        
    return demo_user


async def get_current_active_superuser(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user
