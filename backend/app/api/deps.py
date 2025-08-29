from typing import Generator, Optional, Dict, Any
from datetime import datetime, timedelta
import time

from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session
import aioredis

from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal, get_db
from app.models.user import User as UserModel
from app.models.api_key import APIKey, APIKeyUsage
from app import crud, schemas
from app.core.redis import get_redis

# Security schemes
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)

api_key_scheme = HTTPBearer(auto_error=False)

# Database dependency
async def get_db() -> Generator:
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()

# User authentication
def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(reusable_oauth2)
) -> UserModel:
    """
    Get the current user from the JWT token.
    
    This is used for standard user authentication.
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = crud.user.get_user(db, user_id=token_data.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    
    return user

def get_current_active_user(
    current_user: UserModel = Depends(get_current_user),
) -> UserModel:
    """Get the current active user."""
    if not crud.user.is_active(current_user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user


def get_current_active_superuser(
    current_user: UserModel = Depends(get_current_user),
) -> UserModel:
    """Get the current active superuser."""
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="The user doesn't have enough privileges"
        )
    return current_user

def get_current_user_with_refresh_token(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> UserModel:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
        
        if token_data.type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid token type",
            )
            
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    user = crud.user.get_user(db, user_id=token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    if user.refresh_token != token or user.refresh_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid refresh token",
        )
    
    return user

# API Key Authentication
async def get_api_key(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(api_key_scheme),
    db: Session = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis)
) -> APIKey:
    """
    Get and validate an API key from the request headers.
    
    This is used for API key authentication.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not credentials.scheme.lower() == "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # The token should be in the format "key_id.secret"
    token = credentials.credentials
    
    try:
        key_id, key_secret = token.split('.', 1)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get the API key from the database
    api_key = await crud.api_key.get_by_key_id(db, key_id=key_id)
    
    if not api_key or not api_key.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify the key secret
    if not security.verify_password(key_secret, api_key.hashed_secret):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if the key has expired
    if api_key.expires_at and api_key.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check rate limiting
    endpoint = f"{request.method}:{request.url.path}"
    rate_limit_key = f"rate_limit:{api_key.id}:{endpoint}:{int(time.time() // 60)}"
    
    # Get current count from Redis
    current = await redis.get(rate_limit_key)
    current = int(current) if current else 0
    
    # Check if rate limit is exceeded
    if current >= (api_key.rate_limit or settings.API_KEY_RATE_LIMIT_DEFAULT):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers={
                "Retry-After": "60",
                "X-RateLimit-Limit": str(api_key.rate_limit or settings.API_KEY_RATE_LIMIT_DEFAULT),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(time.time()) + 60)
            }
        )
    
    # Increment the counter in Redis with a 1-minute expiration
    await redis.incr(rate_limit_key)
    await redis.expire(rate_limit_key, 60)
    
    # Store the API key and rate limit info in the request state
    request.state.api_key = api_key
    request.state.rate_limit = {
        "limit": api_key.rate_limit or settings.API_KEY_RATE_LIMIT_DEFAULT,
        "remaining": (api_key.rate_limit or settings.API_KEY_RATE_LIMIT_DEFAULT) - current - 1,
        "reset": int(time.time()) + 60
    }
    
    # Update last used timestamp
    api_key.last_used_at = datetime.utcnow()
    db.add(api_key)
    await db.commit()
    
    return api_key

# Rate limiting
def rate_limit(
    limit: int = settings.API_KEY_RATE_LIMIT_DEFAULT,
    window: int = 60  # seconds
):
    """
    Dependency to implement rate limiting on an endpoint.
    
    Args:
        limit: Maximum number of requests allowed in the time window
        window: Time window in seconds
    """
    async def rate_limiter(
        request: Request,
        response: Response,
        api_key: APIKey = Depends(get_api_key)
    ) -> None:
        # Get the endpoint identifier (method + path)
        endpoint = f"{request.method}:{request.url.path}"
        
        # Create a rate limit key
        current_window = int(time.time() // window)
        rate_limit_key = f"rate_limit:{api_key.id}:{endpoint}:{current_window}"
        
        # Get Redis client
        redis = await get_redis()
        
        # Get current count
        current = await redis.get(rate_limit_key)
        current = int(current) if current else 0
        
        # Check if rate limit is exceeded
        if current >= limit:
            response.headers.update({
                "Retry-After": str(window),
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str((current_window + 1) * window)
            })
            
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
                headers={
                    "Retry-After": str(window),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str((current_window + 1) * window)
                }
            )
        
        # Increment the counter
        await redis.incr(rate_limit_key)
        await redis.expire(rate_limit_key, window)
        
        # Add rate limit headers to the response
        response.headers.update({
            "X-RateLimit-Limit": str(limit),
            "X-RateLimit-Remaining": str(limit - current - 1),
            "X-RateLimit-Reset": str((current_window + 1) * window)
        })
    
    return rate_limiter

# API Key Scopes
def require_scope(required_scope: str):
    """
    Dependency to check if the API key has the required scope.
    
    Args:
        required_scope: The scope required to access the endpoint
    """
    async def check_scope(
        api_key: APIKey = Depends(get_api_key)
    ) -> APIKey:
        if not api_key.scopes or required_scope not in api_key.scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"API key is missing required scope: {required_scope}"
            )
        return api_key
    
    return check_scope
