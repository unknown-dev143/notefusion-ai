from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from app.core.config import settings
from app.core.logging import LoggingMiddleware

# Initialize Sentry error tracking
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[FastApiIntegration()],
        environment=settings.ENVIRONMENT,
        traces_sample_rate=1.0,
    )

from app.routers import (
    auth_router,
    users_router,
    notes_router,
    notifications_router,
    websocket_router,
    ai_router,
    mindmaps_router,
    presentations_router,
    realtime_router,
    tasks_router,
    google_auth_router,
)
from app.core.database import init_db
from app.routers.learning import router as learning_router
from app.routers.chat import router as chat_router
from app.routers.password_reset import router as password_reset_router
from app.routers.payments import router as payments_router

# Prometheus metrics instrumentation
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="NoteFusion AI – Personal Learning Engine API",
    version="2.0.0",
)

# Expose /metrics endpoint for Prometheus to scrape
Instrumentator().instrument(app).expose(app)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.add_middleware(LoggingMiddleware)

from fastapi import Request, HTTPException, status
import time

# ------------------------------------------------------------
# Rate limiting (SlowAPI)
# ------------------------------------------------------------
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Let SlowAPI handle per‑endpoint limits; this middleware can be used for
    # global rules such as banning IPs or checking Redis token buckets.
    response = await call_next(request)
    return response

@app.on_event("startup")
async def startup_event():
    # Don't crash the whole service if DB is briefly unreachable on first boot
    try:
        await init_db()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).error("Database init failed (will retry on requests): %s", exc)
    # Start background cleanup for the in-memory token blacklist
    import asyncio
    from app.core.token_store import start_cleanup_loop
    asyncio.create_task(start_cleanup_loop())

# Include Routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users_router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(notes_router, prefix=f"{settings.API_V1_STR}/notes", tags=["notes"])
app.include_router(mindmaps_router, prefix=f"{settings.API_V1_STR}/mindmaps", tags=["mindmaps"])
app.include_router(presentations_router, prefix=f"{settings.API_V1_STR}/presentations", tags=["presentations"])
app.include_router(learning_router, prefix=f"{settings.API_V1_STR}/learning", tags=["learning"])
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(notifications_router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
app.include_router(ai_router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
app.include_router(websocket_router, prefix="/ws", tags=["websocket"])
app.include_router(realtime_router, prefix="/ws", tags=["collaboration"])
app.include_router(password_reset_router, prefix=f"{settings.API_V1_STR}")
app.include_router(payments_router, prefix=f"{settings.API_V1_STR}", tags=["payments"])
app.include_router(tasks_router, prefix=f"{settings.API_V1_STR}/tasks", tags=["tasks"])
app.include_router(google_auth_router, prefix=f"{settings.API_V1_STR}", tags=["google-auth"])

@app.get("/health")
async def health_check():
    """Simple health‑check used by orchestrators and load‑balancers."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}

@app.get("/")
async def root():
    return {"message": "Welcome to NoteFusion AI Personal Learning Engine API"}
