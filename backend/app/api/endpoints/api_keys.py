"""
API endpoints for managing API keys.
"""
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.core.api_keys import APIKeyAuth, generate_api_key
from app.db.session import get_db
from app.models.api_key import (
    APIKeyCreate,
    APIKeyInDB,
    APIKeyResponse,
    APIKeyUpdate,
    RateLimitInfo
)
from app.crud.crud_api_key import crud_api_key
from app.schemas.user import UserInDB

router = APIRouter()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post(
    "/keys/",
    response_model=APIKeyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new API key",
    description="Create a new API key for the authenticated user.",
)
async def create_api_key(
    *,
    db: AsyncSession = Depends(get_db),
    key_in: APIKeyCreate,
    current_user: UserInDB = Depends(get_current_user),
) -> APIKeyResponse:
    """Create a new API key for the authenticated user."""
    # Set the user ID to the current user
    key_in.user_id = current_user.id
    
    # Create the API key
    api_key = await crud_api_key.create(db, obj_in=key_in)
    return api_key

@router.get(
    "/keys/",
    response_model=List[APIKeyInDB],
    summary="List API keys",
    description="List all API keys for the authenticated user.",
)
async def list_api_keys(
    *,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserInDB = Depends(get_current_user),
) -> List[APIKeyInDB]:
    """List all API keys for the authenticated user."""
    api_keys = await crud_api_key.get_multi(
        db, 
        skip=skip, 
        limit=limit,
        user_id=current_user.id
    )
    return api_keys

@router.get(
    "/keys/{key_id}",
    response_model=APIKeyInDB,
    summary="Get API key",
    description="Get an API key by ID.",
)
async def get_api_key(
    *,
    db: AsyncSession = Depends(get_db),
    key_id: UUID,
    current_user: UserInDB = Depends(get_current_user),
) -> APIKeyInDB:
    """Get an API key by ID."""
    api_key = await crud_api_key.get(db, id=key_id)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found",
        )
    
    # Check if the user owns the API key
    if str(api_key.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    return api_key

@router.patch(
    "/keys/{key_id}",
    response_model=APIKeyInDB,
    summary="Update API key",
    description="Update an API key.",
)
async def update_api_key(
    *,
    db: AsyncSession = Depends(get_db),
    key_id: UUID,
    key_in: APIKeyUpdate,
    current_user: UserInDB = Depends(get_current_user),
) -> APIKeyInDB:
    """Update an API key."""
    # Get the API key
    api_key = await crud_api_key.get(db, id=key_id)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found",
        )
    
    # Check if the user owns the API key
    if str(api_key.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Update the API key
    api_key = await crud_api_key.update(db, db_obj=api_key, obj_in=key_in)
    return api_key

@router.delete(
    "/keys/{key_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete API key",
    description="Delete an API key.",
)
async def delete_api_key(
    *,
    db: AsyncSession = Depends(get_db),
    key_id: UUID,
    current_user: UserInDB = Depends(get_current_user),
) -> None:
    """Delete an API key."""
    # Get the API key
    api_key = await crud_api_key.get(db, id=key_id)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found",
        )
    
    # Check if the user owns the API key
    if str(api_key.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Delete the API key
    await crud_api_key.delete(db, id=key_id)
    return None

@router.post(
    "/keys/{key_id}/deactivate",
    response_model=APIKeyInDB,
    summary="Deactivate API key",
    description="Deactivate an API key.",
)
async def deactivate_api_key(
    *,
    db: AsyncSession = Depends(get_db),
    key_id: UUID,
    current_user: UserInDB = Depends(get_current_user),
) -> APIKeyInDB:
    """Deactivate an API key."""
    # Get the API key
    api_key = await crud_api_key.get(db, id=key_id)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found",
        )
    
    # Check if the user owns the API key
    if str(api_key.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Deactivate the API key
    api_key = await crud_api_key.update(
        db, 
        db_obj=api_key, 
        obj_in=APIKeyUpdate(is_active=False)
    )
    return api_key

@router.get(
    "/keys/{key_id}/rate-limit",
    response_model=RateLimitInfo,
    summary="Get rate limit info",
    description="Get rate limit information for an API key.",
)
async def get_rate_limit_info(
    *,
    db: AsyncSession = Depends(get_db),
    key_id: UUID,
    current_user: UserInDB = Depends(get_current_user),
) -> RateLimitInfo:
    """Get rate limit information for an API key."""
    # Get the API key
    api_key = await crud_api_key.get(db, id=key_id)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found",
        )
    
    # Check if the user owns the API key
    if str(api_key.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Calculate the current rate limit window
    window_start = datetime.utcnow().replace(second=0, microsecond=0)
    
    # Get the current request count for this window
    # This is a simplified example - in production, you'd use Redis for this
    request_count = 0  # Implement actual counting logic here
    
    return RateLimitInfo(
        limit=api_key.rate_limit or 0,
        remaining=max(0, (api_key.rate_limit or 0) - request_count),
        reset=int((window_start + timedelta(minutes=1)).timestamp())
    )
