"""API v1 routers."""
from fastapi import APIRouter

from app.api.endpoints import (
    auth,
    users,
    notes,
    tasks,
    ai,
    reminders,
)

api_router = APIRouter()

# Include all API endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(reminders.router, prefix="/reminders", tags=["reminders"])
