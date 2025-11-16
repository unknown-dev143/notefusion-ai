"""
API Key utility functions for NoteFusion AI.

This module provides functions for generating, validating, and managing API keys.
"""
import hmac
import hashlib
import secrets
import string
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple, List, Union

from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.core.config import settings
from app.core.security import verify_password, get_password_hash
from app.db.session import get_db
from app.models.api_key import APIKey, APIKeyUsage
from app.schemas.api_key import APIKeyCreate, APIKeyUpdate, APIKeyInDB

# Security scheme for API key authentication
security = HTTPBearer()

def generate_api_key(prefix: str = None, length: int = None) -> Tuple[str, str]:
    """
    Generate a new API key with the given prefix and length.
    
    Args:
        prefix: The prefix for the API key (defaults to settings.API_KEY_PREFIX)
        length: The length of the random part of the key (defaults to settings.API_KEY_LENGTH)
        
    Returns:
        Tuple of (api_key_id, api_key_secret)
    """
    if prefix is None:
        prefix = settings.API_KEY_PREFIX
    if length is None:
        length = settings.API_KEY_LENGTH
    
    # Generate a random string for the secret part
    alphabet = string.ascii_letters + string.digits
    secret = ''.join(secrets.choice(alphabet) for _ in range(length))
    
    # Create a unique ID for the key
    key_id = f"{prefix}{secrets.token_urlsafe(16)}"
    
    # Hash the secret part for storage
    hashed_secret = _hash_api_key(secret)
    
    return key_id, f"{key_id}.{secret}"  # Return the full key for the user to save

def _hash_api_key(api_key: str) -> str:
    """Hash an API key using HMAC-SHA256."""
    return hmac.new(
        settings.API_KEY_SECRET.encode(),
        api_key.encode(),
        hashlib.sha256
    ).hexdigest()

async def validate_api_key(
    key_id: str,
    key_secret: str,
    db: Session
) -> Optional[APIKey]:
    """
    Validate an API key ID and secret.
    
    Args:
        key_id: The API key ID
        key_secret: The API key secret
        db: Database session
        
    Returns:
        The API key record if valid, None otherwise
    """
    # Get the API key from the database
    api_key = db.query(APIKey).filter(
        APIKey.key_id == key_id,
        APIKey.is_active == True,
        or_(
            APIKey.expires_at.is_(None),
            APIKey.expires_at > datetime.utcnow()
        )
    ).first()
    
    if not api_key:
        return None
    
    # Verify the key secret
    if not verify_password(key_secret, api_key.hashed_secret):
        return None
    
    return api_key

async def check_rate_limit(
    api_key: APIKey,
    db: Session,
    endpoint: str,
    cost: int = 1
) -> Dict[str, Any]:
    """
    Check if the API key has exceeded its rate limit.
    
    Args:
        api_key: The API key record
        db: Database session
        endpoint: The endpoint being accessed
        cost: The cost of the request in terms of rate limiting
        
    Returns:
        Dict with rate limit information
    """
    from app.core.redis import get_redis
    
    # Get the rate limit for this key (or use default)
    rate_limit = api_key.rate_limit or settings.API_KEY_RATE_LIMIT_DEFAULT
    window = settings.API_KEY_RATE_LIMIT_WINDOW
    
    # Create a unique key for this API key and endpoint
    redis_key = f"rate_limit:{api_key.key_id}:{endpoint}:{int(time.time() // window)}"
    
    # Get Redis client
    redis = await get_redis()
    
    # Get current count
    current = await redis.get(redis_key)
    current = int(current) if current else 0
    
    # Check if rate limit is exceeded
    if current + cost > rate_limit:
        return {
            "allowed": False,
            "limit": rate_limit,
            "remaining": 0,
            "reset": window - (int(time.time()) % window),
            "retry_after": window - (int(time.time()) % window)
        }
    
    # Increment the counter
    await redis.incrby(redis_key, cost)
    await redis.expire(redis_key, window)
    
    return {
        "allowed": True,
        "limit": rate_limit,
        "remaining": rate_limit - current - cost,
        "reset": window - (int(time.time()) % window)
    }

async def log_api_usage(
    db: Session,
    api_key_id: str,
    endpoint: str,
    method: str,
    status_code: int,
    user_agent: str = None,
    ip_address: str = None,
    response_time: float = None,
    error: str = None
) -> APIKeyUsage:
    """
    Log API key usage to the database.
    
    Args:
        db: Database session
        api_key_id: The ID of the API key
        endpoint: The endpoint that was accessed
        method: The HTTP method used
        status_code: The HTTP status code of the response
        user_agent: The User-Agent header from the request
        ip_address: The IP address of the client
        response_time: The response time in seconds
        error: Any error that occurred
        
    Returns:
        The created APIKeyUsage record
    """
    usage = APIKeyUsage(
        api_key_id=api_key_id,
        endpoint=endpoint,
        method=method,
        status_code=status_code,
        user_agent=user_agent,
        ip_address=ip_address,
        response_time=response_time,
        error=error,
        timestamp=datetime.utcnow()
    )
    
    db.add(usage)
    db.commit()
    db.refresh(usage)
    
    return usage

async def get_api_key(
    key_id: str,
    db: Session,
    user_id: str = None
) -> Optional[APIKey]:
    """
    Get an API key by ID.
    
    Args:
        key_id: The ID of the API key
        db: Database session
        user_id: Optional user ID to verify ownership
        
    Returns:
        The API key record if found and accessible, None otherwise
    """
    query = db.query(APIKey).filter(APIKey.key_id == key_id)
    
    if user_id is not None:
        query = query.filter(APIKey.user_id == user_id)
    
    return query.first()

async def create_api_key(
    db: Session,
    key_data: APIKeyCreate,
    user_id: str
) -> APIKey:
    """
    Create a new API key.
    
    Args:
        db: Database session
        key_data: The API key data
        user_id: The ID of the user creating the key
        
    Returns:
        The created API key record
    """
    # Generate a new API key
    key_id, full_key = generate_api_key(
        prefix=key_data.prefix,
        length=key_data.length
    )
    
    # Hash the secret part for storage
    _, secret = full_key.split('.', 1)
    hashed_secret = _hash_api_key(secret)
    
    # Calculate expiration date if specified
    expires_at = None
    if key_data.expires_in_days is not None:
        expires_at = datetime.utcnow() + timedelta(days=key_data.expires_in_days)
    
    # Create the API key record
    db_key = APIKey(
        key_id=key_id,
        hashed_secret=hashed_secret,
        user_id=user_id,
        name=key_data.name,
        description=key_data.description,
        rate_limit=key_data.rate_limit,
        expires_at=expires_at,
        is_active=True,
        created_at=datetime.utcnow(),
        last_used_at=None
    )
    
    db.add(db_key)
    db.commit()
    db.refresh(db_key)
    
    # Return the full key to the user (this is the only time they'll see it)
    db_key.key = full_key
    
    return db_key

async def update_api_key(
    db: Session,
    key_id: str,
    key_data: APIKeyUpdate,
    user_id: str = None
) -> Optional[APIKey]:
    """
    Update an API key.
    
    Args:
        db: Database session
        key_id: The ID of the API key to update
        key_data: The updated API key data
        user_id: Optional user ID to verify ownership
        
    Returns:
        The updated API key record, or None if not found
    """
    # Get the API key
    query = db.query(APIKey).filter(APIKey.key_id == key_id)
    
    if user_id is not None:
        query = query.filter(APIKey.user_id == user_id)
    
    db_key = query.first()
    
    if not db_key:
        return None
    
    # Update the fields
    if key_data.name is not None:
        db_key.name = key_data.name
    
    if key_data.description is not None:
        db_key.description = key_data.description
    
    if key_data.rate_limit is not None:
        db_key.rate_limit = key_data.rate_limit
    
    if key_data.is_active is not None:
        db_key.is_active = key_data.is_active
    
    if key_data.expires_in_days is not None:
        if key_data.expires_in_days == 0:
            db_key.expires_at = None
        else:
            db_key.expires_at = datetime.utcnow() + timedelta(days=key_data.expires_in_days)
    
    db_key.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_key)
    
    return db_key

async def delete_api_key(
    db: Session,
    key_id: str,
    user_id: str = None
) -> bool:
    """
    Delete an API key.
    
    Args:
        db: Database session
        key_id: The ID of the API key to delete
        user_id: Optional user ID to verify ownership
        
    Returns:
        True if the key was deleted, False if not found
    """
    # Get the API key
    query = db.query(APIKey).filter(APIKey.key_id == key_id)
    
    if user_id is not None:
        query = query.filter(APIKey.user_id == user_id)
    
    db_key = query.first()
    
    if not db_key:
        return False
    
    # Delete the key
    db.delete(db_key)
    db.commit()
    
    return True

async def get_user_api_keys(
    db: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[APIKey]:
    """
    Get all API keys for a user.
    
    Args:
        db: Database session
        user_id: The ID of the user
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of API key records
    """
    return db.query(APIKey)\
        .filter(APIKey.user_id == user_id)\
        .order_by(APIKey.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

async def get_api_key_usage(
    db: Session,
    key_id: str,
    user_id: str = None,
    start_date: datetime = None,
    end_date: datetime = None,
    skip: int = 0,
    limit: int = 100
) -> List[APIKeyUsage]:
    """
    Get usage statistics for an API key.
    
    Args:
        db: Database session
        key_id: The ID of the API key
        user_id: Optional user ID to verify ownership
        start_date: Optional start date for filtering
        end_date: Optional end date for filtering
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of API key usage records
    """
    query = db.query(APIKeyUsage).filter(APIKeyUsage.api_key_id == key_id)
    
    # Verify ownership if user_id is provided
    if user_id is not None:
        query = query.join(APIKey).filter(APIKey.user_id == user_id)
    
    # Apply date filters
    if start_date is not None:
        query = query.filter(APIKeyUsage.timestamp >= start_date)
    
    if end_date is not None:
        query = query.filter(APIKeyUsage.timestamp <= end_date)
    
    return query.order_by(APIKeyUsage.timestamp.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

# FastAPI dependencies
async def get_current_api_key(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> APIKey:
    """
    FastAPI dependency to get the current API key from the request.
    
    Args:
        request: The FastAPI request object
        credentials: The HTTP authorization credentials
        db: Database session
        
    Returns:
        The API key record if valid
        
    Raises:
        HTTPException: If the API key is invalid or missing
    """
    if credentials.scheme.lower() != "bearer":
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
    
    # Validate the API key
    api_key = await validate_api_key(key_id, key_secret, db)
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check rate limiting
    endpoint = f"{request.method}:{request.url.path}"
    rate_limit = await check_rate_limit(api_key, db, endpoint)
    
    if not rate_limit["allowed"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers={
                "Retry-After": str(rate_limit["retry_after"]),
                "X-RateLimit-Limit": str(rate_limit["limit"]),
                "X-RateLimit-Remaining": str(rate_limit["remaining"]),
                "X-RateLimit-Reset": str(rate_limit["reset"])
            }
        )
    
    # Update last used timestamp
    api_key.last_used_at = datetime.utcnow()
    db.commit()
    
    # Add rate limit headers to the response
    request.state.rate_limit = rate_limit
    
    return api_key

# Helper function to get API key from header
async def get_api_key_from_header(
    request: Request,
    header_name: str = "X-API-Key"
) -> Optional[str]:
    """
    Get the API key from the request headers.
    
    Args:
        request: The FastAPI request object
        header_name: The name of the header containing the API key
        
    Returns:
        The API key if found, None otherwise
    """
    api_key = request.headers.get(header_name)
    
    if not api_key:
        return None
    
    # The API key should be in the format "key_id.secret"
    try:
        key_id, _ = api_key.split('.', 1)
        return key_id
    except ValueError:
        return None
