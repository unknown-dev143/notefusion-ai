"""
API Key management and validation.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, List
import secrets
import hashlib
import hmac

from fastapi import HTTPException, status, Request, Depends
from fastapi.security import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.api_key import APIKey, APIKeyCreate, APIKeyInDB, APIKeyUsage
from app.crud.crud_api_key import crud_api_key

API_KEY_HEADER = "X-API-Key"
API_KEY_PREFIX = "nf_"
API_KEY_LENGTH = 32
API_KEY_SECRET = "your-api-key-secret"  # Should be in environment variables

class APIKeyAuth(APIKeyHeader):
    """API Key authentication."""
    
    def __init__(self, auto_error: bool = True):
        super().__init__(name=API_KEY_HEADER, auto_error=auto_error)

    async def __call__(self, request: Request) -> str:
        api_key = request.headers.get(self.model.name)
        if not api_key:
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="API key is missing",
                )
            return ""
        return api_key

def generate_api_key() -> str:
    """Generate a new API key."""
    # Generate a random string
    random_bytes = secrets.token_bytes(API_KEY_LENGTH)
    # Create a key with prefix
    key = API_KEY_PREFIX + random_bytes.hex()
    # Create a signature
    signature = hmac.new(
        API_KEY_SECRET.encode(),
        key.encode(),
        hashlib.sha256
    ).hexdigest()
    # Combine key and signature
    return f"{key}.{signature}"

def validate_api_key(api_key: str) -> bool:
    """Validate an API key format and signature."""
    if not api_key or "." not in api_key:
        return False
    
    key_part, signature_part = api_key.rsplit(".", 1)
    if not key_part.startswith(API_KEY_PREFIX):
        return False
    
    # Verify the signature
    expected_signature = hmac.new(
        API_KEY_SECRET.encode(),
        key_part.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature_part, expected_signature)

async def get_api_key_owner(
    api_key: str,
    db: AsyncSession
) -> Optional[APIKeyInDB]:
    """Get the owner of an API key."""
    # Extract the key part before the signature
    key_part = api_key.split(".")[0] if api_key else ""
    return await crud_api_key.get_by_key(db, key_part=key_part)

async def check_api_key(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> APIKeyInDB:
    """Dependency to check API key in the request."""
    api_key = request.headers.get(API_KEY_HEADER)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is missing",
        )
    
    # Validate the API key format and signature
    if not validate_api_key(api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key format",
        )
    
    # Get the API key from the database
    db_api_key = await get_api_key_owner(api_key, db)
    if not db_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )
    
    # Check if the API key is active
    if not db_api_key.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is inactive",
        )
    
    # Check if the API key is expired
    if db_api_key.expires_at and db_api_key.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key has expired",
        )
    
    # Check rate limiting
    if await is_rate_limited(db_api_key, request):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers={"Retry-After": "60"},
        )
    
    # Log the API key usage
    await log_api_key_usage(db_api_key, request)
    
    return db_api_key

async def is_rate_limited(
    api_key: APIKeyInDB,
    request: Request
) -> bool:
    """Check if the API key has exceeded its rate limit."""
    # Implement rate limiting logic here
    # You can use Redis for distributed rate limiting
    # For now, we'll just check the basic rate limit
    if api_key.rate_limit and api_key.rate_limit > 0:
        # Get the current usage for the time window
        current_usage = await get_current_usage(api_key.id, request)
        return current_usage >= api_key.rate_limit
    return False

async def get_current_usage(
    api_key_id: int,
    request: Request
) -> int:
    """Get the current usage for an API key in the current time window."""
    # Implement logic to get the current usage from Redis
    # For now, return 0
    return 0

async def log_api_key_usage(
    api_key: APIKeyInDB,
    request: Request
) -> None:
    """Log API key usage."""
    # Implement logging logic here
    # You can log to a database or a logging service
    pass
