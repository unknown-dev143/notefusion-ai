"""
API endpoints for managing API keys.
"""
from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.core.config import settings
from app.core.api_key_utils import get_current_api_key
from app.crud import crud_api_key, crud_user
from app.db.session import get_db
from app.models.api_key import APIKeyInDB, APIKeyCreate, APIKeyUpdate, APIKeyResponse, APIKeyUsage, RateLimitInfo
from app.models.user import UserInDB
from app.schemas.common import SuccessResponseModel, ListResponseModel

router = APIRouter()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

@router.post(
    "/",
    response_model=SuccessResponseModel[APIKeyResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new API key",
    description="Create a new API key for the authenticated user.",
    response_description="The created API key"
)
async def create_api_key(
    *,
    db: AsyncSession = Depends(get_db),
    api_key_in: APIKeyCreate,
    current_user: UserInDB = Depends(security.get_current_active_user),
) -> Any:
    """
    Create a new API key for the authenticated user.
    
    The full API key will only be shown once upon creation.
    """
    # Create the API key
    api_key = await crud_api_key.create(
        db=db,
        obj_in=api_key_in,
        user_id=current_user.id
    )
    
    return {
        "success": True,
        "message": "API key created successfully",
        "data": api_key
    }

@router.get(
    "/",
    response_model=SuccessResponseModel[List[APIKeyResponse]],
    summary="List API keys",
    description="List all API keys for the authenticated user.",
    response_description="List of API keys"
)
async def list_api_keys(
    *,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserInDB = Depends(security.get_current_active_user),
) -> Any:
    """
    List all API keys for the authenticated user.
    """
    api_keys = await crud_api_key.get_multi_by_owner(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    
    return {
        "success": True,
        "message": "API keys retrieved successfully",
        "data": api_keys
    }

@router.get(
    "/{key_id}",
    response_model=SuccessResponseModel[APIKeyResponse],
    summary="Get API key",
    description="Get a specific API key by ID.",
    response_description="The requested API key"
)
async def get_api_key(
    *,
    db: AsyncSession = Depends(get_db),
    key_id: str,
    current_user: UserInDB = Depends(security.get_current_active_user),
) -> Any:
    """
    Get a specific API key by ID.
    """
    api_key = await crud_api_key.get(db=db, key_id=key_id)
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    if str(api_key.user_id) != str(current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return {
        "success": True,
        "message": "API key retrieved successfully",
        "data": api_key
    }

@router.patch(
    "/{key_id}",
    response_model=SuccessResponseModel[APIKeyResponse],
    summary="Update API key",
    description="Update an existing API key.",
    response_description="The updated API key"
)
async def update_api_key(
    *,
    db: AsyncSession = Depends(get_db),
    key_id: str,
    api_key_in: APIKeyUpdate,
    current_user: UserInDB = Depends(security.get_current_active_user),
) -> Any:
    """
    Update an API key.
    """
    # First, get the API key to check ownership
    db_api_key = await crud_api_key.get(db=db, key_id=key_id)
    
    if not db_api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    if str(db_api_key.user_id) != str(current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update the API key
    api_key = await crud_api_key.update(
        db=db,
        db_obj=db_api_key,
        obj_in=api_key_in
    )
    
    return {
        "success": True,
        "message": "API key updated successfully",
        "data": api_key
    }

@router.delete(
    "/{key_id}",
    response_model=SuccessResponseModel[dict],
    summary="Delete API key",
    description="Delete an API key.",
    response_description="Success message"
)
async def delete_api_key(
    *,
    db: AsyncSession = Depends(get_db),
    key_id: str,
    current_user: UserInDB = Depends(security.get_current_active_user),
) -> Any:
    """
    Delete an API key.
    """
    # First, get the API key to check ownership
    db_api_key = await crud_api_key.get(db=db, key_id=key_id)
    
    if not db_api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    if str(db_api_key.user_id) != str(current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Delete the API key
    await crud_api_key.remove(db=db, key_id=key_id)
    
    return {
        "success": True,
        "message": "API key deleted successfully",
        "data": {}
    }

@router.get(
    "/{key_id}/usage",
    response_model=SuccessResponseModel[List[APIKeyUsage]],
    summary="Get API key usage",
    description="Get usage statistics for an API key.",
    response_description="List of API key usage records"
)
async def get_api_key_usage(
    *,
    db: AsyncSession = Depends(get_db),
    key_id: str,
    skip: int = 0,
    limit: int = 100,
    current_user: UserInDB = Depends(security.get_current_active_user),
) -> Any:
    """
    Get usage statistics for an API key.
    """
    # First, get the API key to check ownership
    db_api_key = await crud_api_key.get(db=db, key_id=key_id)
    
    if not db_api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    if str(db_api_key.user_id) != str(current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get the usage statistics
    usage = await crud_api_key.get_usage(
        db=db,
        key_id=key_id,
        skip=skip,
        limit=limit
    )
    
    return {
        "success": True,
        "message": "API key usage retrieved successfully",
        "data": usage
    }

@router.get(
    "/{key_id}/rate-limit",
    response_model=SuccessResponseModel[RateLimitInfo],
    summary="Get API key rate limit",
    description="Get rate limit information for an API key.",
    response_description="Rate limit information"
)
async def get_api_key_rate_limit(
    *,
    request: Request,
    key_id: str,
    current_user: UserInDB = Depends(security.get_current_active_user),
) -> Any:
    """
    Get rate limit information for an API key.
    """
    # This endpoint would typically check Redis for rate limit information
    # For now, we'll return a placeholder response
    return {
        "success": True,
        "message": "Rate limit information retrieved successfully",
        "data": {
            "limit": 1000,
            "remaining": 987,
            "reset": int(request.state.rate_limit["reset"]) if hasattr(request.state, "rate_limit") else 3600,
            "retry_after": None
        }
    }

# Add the API key authentication dependency to the router
router.dependencies = [Depends(get_current_api_key)]
