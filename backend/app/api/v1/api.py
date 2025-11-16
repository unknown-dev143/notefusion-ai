"""
API v1 Router

This module contains all API v1 endpoints.
"""
from fastapi import APIRouter, Depends

from app.api.v1.endpoints import users, auth, api_keys, ai
from app.core.security import get_current_active_user
from app.models.user import UserInDB

api_router = APIRouter()

# Include all API v1 endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(get_current_active_user)],
)
api_router.include_router(
    api_keys.router,
    prefix="/api-keys",
    tags=["api-keys"],
    dependencies=[Depends(get_current_active_user)],
)

api_router.include_router(
    ai.router,
    prefix="/ai",
    tags=["ai"],
    dependencies=[Depends(get_current_active_user)],
)

# Add a health check endpoint
@api_router.get("/health", tags=["health"])
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "version": "v1"}

# Add a protected test endpoint
@api_router.get("/test-auth", tags=["test"])
async def test_auth(
    current_user: UserInDB = Depends(get_current_active_user)
) -> dict:
    """Test authentication endpoint."""
    return {
        "message": "You are authenticated!",
        "user_id": str(current_user.id),
        "email": current_user.email,
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser,
    }
