"""API Key models."""
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator, HttpUrl
from uuid import UUID, uuid4

from app.core.config import settings

class APIKeyBase(BaseModel):
    """Base API key model."""
    name: str = Field(
        ..., 
        max_length=100,
        description="A descriptive name for the API key"
    )
    user_id: UUID = Field(
        ..., 
        description="ID of the user who owns this key"
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional description of what this key is used for"
    )
    rate_limit: Optional[int] = Field(
        settings.API_KEY_RATE_LIMIT_DEFAULT,
        ge=1,
        le=10000,
        description="Maximum number of requests per minute (None for no limit)"
    )
    expires_at: Optional[datetime] = Field(
        None,
        description="When this key expires (None for no expiration)"
    )
    is_active: bool = Field(
        True,
        description="Whether this key is active and can be used"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Additional metadata for the API key"
    )

class APIKeyCreate(BaseModel):
    """Model for creating a new API key."""
    name: str = Field(..., max_length=100, description="A name for the API key")
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional description of what this key is used for"
    )
    prefix: Optional[str] = Field(
        settings.API_KEY_PREFIX,
        description="Prefix for the API key (defaults to settings.API_KEY_PREFIX)"
    )
    length: Optional[int] = Field(
        settings.API_KEY_LENGTH,
        ge=16,
        le=128,
        description="Length of the API key (defaults to settings.API_KEY_LENGTH)"
    )
    rate_limit: Optional[int] = Field(
        settings.API_KEY_RATE_LIMIT_DEFAULT,
        ge=1,
        le=10000,
        description="Maximum requests per minute (defaults to settings.API_KEY_RATE_LIMIT_DEFAULT)"
    )
    expires_in_days: Optional[int] = Field(
        settings.API_KEY_EXPIRE_DAYS,
        ge=1,
        description="Number of days until the key expires (None for no expiration)"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional metadata to store with the key"
    )

class APIKeyUpdate(BaseModel):
    """Model for updating an API key."""
    name: Optional[str] = Field(
        None,
        max_length=100,
        description="New name for the API key"
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="New description for the API key"
    )
    rate_limit: Optional[int] = Field(
        None,
        ge=1,
        le=10000,
        description="New rate limit (requests per minute)"
    )
    expires_in_days: Optional[int] = Field(
        None,
        ge=1,
        description="Number of days until the key expires (0 for no expiration)"
    )
    is_active: Optional[bool] = Field(
        None,
        description="Whether the key should be active or inactive"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional metadata to update"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "name": "New Key Name",
                "description": "Updated description",
                "rate_limit": 200,
                "expires_in_days": 30,
                "is_active": True,
                "metadata": {"purpose": "production"}
            }
        }

class APIKeyInDB(APIKeyBase):
    """API key model as stored in the database."""
    key_id: str = Field(..., description="Unique identifier for the API key")
    hashed_secret: str = Field(..., description="Hashed version of the API key secret")
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When this key was created"
    )
    updated_at: Optional[datetime] = Field(
        None,
        description="When this key was last updated"
    )
    last_used_at: Optional[datetime] = Field(
        None,
        description="When this key was last used"
    )
    
    # Non-database fields
    key: Optional[str] = Field(
        None,
        description="The full API key (only shown once when created)"
    )
    
    class Config:
        orm_mode = True
        
    @validator('expires_at', pre=True, always=True)
    def set_expires_at(cls, v):
        if v is None and settings.API_KEY_EXPIRE_DAYS:
            return datetime.utcnow() + timedelta(days=settings.API_KEY_EXPIRE_DAYS)
        return v

class APIKeyResponse(APIKeyInDB):
    """API key model for responses."""
    usage_count: Optional[int] = Field(
        None,
        description="Number of times this key has been used"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "key_id": "nf_abc123",
                "name": "Production API Key",
                "description": "Used for production integration",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "rate_limit": 100,
                "is_active": True,
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00",
                "last_used_at": "2023-01-01T12:00:00",
                "expires_at": "2024-01-01T00:00:00",
                "usage_count": 42,
                "metadata": {"environment": "production"}
            }
        }

class APIKeyUsage(BaseModel):
    """Model for tracking API key usage."""
    id: UUID = Field(
        default_factory=uuid4,
        description="Unique identifier for the usage record"
    )
    api_key_id: str = Field(
        ...,
        description="ID of the API key that was used"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the request was made"
    )
    endpoint: str = Field(
        ...,
        description="The endpoint that was accessed"
    )
    method: str = Field(
        ...,
        regex="^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)$",
        description="HTTP method used"
    )
    status_code: int = Field(
        ...,
        ge=100,
        le=599,
        description="HTTP status code of the response"
    )
    ip_address: Optional[str] = Field(
        None,
        description="IP address of the client"
    )
    user_agent: Optional[str] = Field(
        None,
        description="User-Agent header from the request"
    )
    response_time: Optional[float] = Field(
        None,
        ge=0,
        description="Response time in seconds"
    )
    error: Optional[str] = Field(
        None,
        description="Error message if the request failed"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional metadata about the request"
    )

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "api_key_id": "nf_abc123",
                "timestamp": "2023-01-01T12:00:00",
                "endpoint": "/api/v1/notes",
                "method": "GET",
                "status_code": 200,
                "ip_address": "192.168.1.1",
                "user_agent": "Mozilla/5.0 ...",
                "response_time": 0.123,
                "error": None,
                "metadata": {"user_id": "user123"}
            }
        }

class RateLimitInfo(BaseModel):
    """Information about rate limiting for an API key."""
    limit: int = Field(
        ...,
        ge=1,
        description="Maximum number of requests allowed in the current window"
    )
    remaining: int = Field(
        ...,
        ge=0,
        description="Number of requests remaining in the current window"
    )
    reset: int = Field(
        ...,
        description="Unix timestamp (in seconds) when the current window resets"
    )
    retry_after: Optional[int] = Field(
        None,
        description="Number of seconds to wait before retrying (only when rate limited)"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "limit": 100,
                "remaining": 42,
                "reset": 1672531200,
                "retry_after": 30
            }
        }
