# Routers package initialization
from .auth import router as auth_router
from .users import router as users_router
from .notes import router as notes_router
from .notifications import router as notifications_router
from .websocket import router as websocket_router
from .ai import router as ai_router
from .mindmaps import router as mindmaps_router
from .presentations import router as presentations_router
from .realtime import router as realtime_router
from .tasks import router as tasks_router
from .google_auth import router as google_auth_router

__all__ = ["auth_router", "users_router", "notes_router", "notifications_router", "websocket_router", "ai_router", "mindmaps_router", "presentations_router", "realtime_router", "tasks_router", "google_auth_router"]

