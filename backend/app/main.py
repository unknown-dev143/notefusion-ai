"""Main application module for NoteFusion AI backend."""
import logging
import time
import asyncio
import os
import json
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional, List, Dict, Any, Callable, Awaitable

from fastapi import (
    FastAPI, 
    UploadFile, 
    File, 
    WebSocket, 
    WebSocketDisconnect,
    HTTPException, 
    BackgroundTasks, 
    Depends, 
    Request, 
    status,
    Query,
    Response
)
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp, Scope, Receive, Send
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from datetime import datetime, timedelta
import httpx
import uuid
import json
from dotenv import load_dotenv

# Import WebSocket manager
from app.websocket import manager as ws_manager
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel

# Import security and logging components
from app.core.security import JWTBearer
from app.core.middleware import setup_security_middleware, SecurityHeadersMiddleware
from app.core.logging_config import setup_logging, setup_request_logging, logger
from app.core.redis import get_redis, init_redis_pool
from app.core.api_key_auth import APIKeyAuthMiddleware
from app.core.rate_limiter import RateLimiter
from app.core.config import settings
from .core.exceptions import (
    AppException,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
    register_exception_handlers,
    http_exception_handler,
    validation_exception_handler,
    app_exception_handler
)

# Configure logging
setup_logging()

# Load environment variables
load_dotenv()

# Import application components
from .config import settings
from .api.endpoints import tasks as task_endpoints

# Initialize security components
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# API Key Authentication
def get_api_key(request: Request):
    """Dependency to get the current API key from the request."""
    return request.state.api_key if hasattr(request.state, "api_key") else None
from .services.transcription.service import TranscriptionService
from .services.pdf.service import PDFService
from .services.fusion.service import FusionService
from .services.model_update_service import ModelUpdateService
from .models.user import User
from .models.ai_models import DBAIModel, UserAIModelSettings, AIProvider, AIModelStatus
from .models.database import SessionLocal, Base, get_db
from .schemas.ai_models import UserAIModelSettings as UserAIModelSettingsSchema
from .middleware.subscription import SubscriptionChecker

# Request timing middleware
class RequestTimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response

# Error handler for database operations
async def handle_database_error(request: Request, exc: Exception):
    logger.error(f"Database error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )

# Create FastAPI app with lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Starting up NoteFusion AI Backend...")
    
    try:
        # Initialize database
        from .models.database import engine, Base
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully")
        
        # Initialize security components
        logger.info("Security components initialized")
        
        yield
        
    except Exception as e:
        logger.critical(f"Error during startup: {str(e)}", exc_info=True)
        raise
    finally:
        # Shutdown logic
        logger.info("Shutting down NoteFusion AI Backend...")

# API Key Authentication Middleware
class APIKeyAuthMiddleware(BaseHTTPMiddleware):
    """Middleware to handle API key authentication."""
    
    async def dispatch(self, request: Request, call_next):
        # Skip API key check for public endpoints
        if any(request.url.path.startswith(path) for path in [
            "/api/v1/auth/",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/api/v1/docs",
            "/api/v1/redoc",
            "/api/v1/openapi.json"
        ]):
            return await call_next(request)
            
        # Get API key from header
        api_key = request.headers.get("X-API-Key")
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key required",
                headers={"WWW-Authenticate": "API-Key"},
            )
            
        # Validate API key
        db = SessionLocal()
        try:
            # Split the key into ID and secret
            try:
                key_id, key_secret = api_key.split('.', 1)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid API key format"
                )
                
            # Get the API key from the database
            api_key_obj = db.query(APIKey).filter(
                APIKey.key_id == key_id,
                APIKey.is_active == True
            ).first()
            
            if not api_key_obj or not api_key_obj.verify_key(key_secret):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid API key"
                )
                
            # Check if the key has expired
            if api_key_obj.is_expired():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="API key has expired"
                )
                
            # Check rate limiting
            redis = await get_redis()
            rate_limiter = RateLimiter(redis)
            
            if not await rate_limiter.check_rate_limit(api_key_obj.key_id):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded",
                    headers={
                        "Retry-After": "60",
                        "X-RateLimit-Limit": str(api_key_obj.rate_limit or settings.API_KEY_RATE_LIMIT_DEFAULT),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(int(time.time()) + 60)
                    }
                )
                
            # Update last used timestamp
            api_key_obj.last_used_at = datetime.utcnow()
            db.add(api_key_obj)
            db.commit()
            
            # Attach the API key to the request state
            request.state.api_key = api_key_obj
            
            # Continue processing the request
            response = await call_next(request)
            
            # Add rate limit headers to the response
            remaining, reset = await rate_limiter.get_remaining_and_reset(api_key_obj.key_id)
            response.headers["X-RateLimit-Limit"] = str(api_key_obj.rate_limit or settings.API_KEY_RATE_LIMIT_DEFAULT)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(reset)
            
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing API key: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
        finally:
            db.close()

# Create the FastAPI application with custom docs settings
app = FastAPI(
    title="NoteFusion AI API",
    description="API for NoteFusion AI application with API key authentication and rate limiting",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Add a test endpoint
@app.get("/test")
async def test_endpoint():
    return {"message": "API is working!"}

# Initialize Redis on startup
@app.on_event("startup")
async def startup_event():
    """Initialize Redis connection pool on startup."""
    app.state.redis = await init_redis_pool()

# Close Redis connection on shutdown
@app.on_event("shutdown")
async def shutdown_event():
    """Close Redis connection on shutdown."""
    if hasattr(app.state, 'redis'):
        await app.state.redis.close()
        await app.state.redis.connection_pool.disconnect()

# Apply all middleware
middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins for now
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    ),
    Middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS,
    ),
    Middleware(GZipMiddleware, minimum_size=1000),
    Middleware(APIKeyAuthMiddleware),
]

# Apply middleware
for mw in middleware:
    app.add_middleware(mw.__class__, **{k: v for k, v in mw.options.items() if k != 'cls'})

# Include API routes
from app.api.v1.api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount static files for API documentation
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Test endpoint
@app.get("/test")
async def test_endpoint():
    """Test endpoint to verify the API is working."""
    return {"message": "API is working!"}

# Test endpoints for AI security features
@app.get("/api/v1/ai/test/security")
async def test_security():
    """Test endpoint for security features."""
    return {"message": "Security test endpoint - if you can see this, security middleware is working"}

@app.post("/api/v1/ai/test/rate-limit")
async def test_rate_limit():
    """Test endpoint for rate limiting."""
    return {"message": "Rate limit test endpoint - make multiple requests to test"}

@app.post("/api/v1/ai/test/content-moderation")
async def test_content_moderation(request: Request):
    """Test endpoint for content moderation."""
    data = await request.json()
    return {"message": "Content moderation test", "content": "This is a safe response"}

# The FastAPI app is now created with all middleware, routes, and the health check endpoint
# Additional middleware and handlers are registered in the create_app() function

# Setup request logging
setup_request_logging(app)

# Add subscription middleware if available
try:
    from .middleware.subscription import SubscriptionChecker
    app.add_middleware(
        SubscriptionChecker,
        required_tier=None,  # No tier required by default, check individual routes
        required_features=[],
        allow_trial=True
    )
except ImportError:
    logger.warning("Subscription middleware not found. Subscription checks will be skipped.")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

# Get Firebase config from environment variables
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
if not FIREBASE_PROJECT_ID:
    raise ValueError("FIREBASE_PROJECT_ID environment variable not set")

async def verify_firebase_token(request: Request):
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = auth.split(" ")[1]
    # Get public keys from Firebase
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com")
        certs = resp.json()
    # Decode JWT header to get key id
    header = jwt.get_unverified_header(token)
    key = certs[header["kid"]]
    try:
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=FIREBASE_PROJECT_ID,
            issuer=f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
        )
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/api/protected")
async def protected_route(user=Depends(verify_firebase_token)):
    return {"message": "You are authenticated!", "user": user}

# AI Models endpoints
@app.get(
    f"{settings.API_V1_STR}/ai/models",
    response_model=Dict[str, Any],
    summary="List available AI models"
)
async def list_ai_models(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """List all available AI models."""
    models = await db.query(DBAIModel).filter(DBAIModel.is_available == True).all()
    return {"models": models}

@app.get(
    f"{settings.API_V1_STR}/ai/models/check-updates",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Check for model updates"
)
async def check_for_updates(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Check for updates to AI models."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can check for updates"
        )
    
    service = ModelUpdateService(db)
    updated = await service.check_for_updates(force=True)
    return {"status": "success" if updated else "no_updates"}

@app.get(
    f"{settings.API_V1_STR}/ai/settings",
    response_model=UserAIModelSettingsSchema,
    summary="Get user AI settings"
)
async def get_user_ai_settings(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get the current user's AI model settings."""
    settings = await db.query(UserAIModelSettings).filter(
        UserAIModelSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        # Create default settings
        default_model = await db.query(DBAIModel).filter(
            DBAIModel.is_available == True,
            DBAIModel.provider == AIProvider.OPENAI
        ).order_by(DBAIModel.created_at.desc()).first()
        
        if not default_model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No available AI models found"
            )
            
        settings = UserAIModelSettings(
            user_id=current_user.id,
            model_id=default_model.id,
            is_auto_upgrade=True
        )
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return settings

@app.patch(
    f"{settings.API_V1_STR}/ai/settings",
    response_model=UserAIModelSettingsSchema,
    summary="Update user AI settings"
)
async def update_user_ai_settings(
    settings_update: UserAIModelSettingsSchema,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update the current user's AI model settings."""
    settings = await db.query(UserAIModelSettings).filter(
        UserAIModelSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        settings = UserAIModelSettings(user_id=current_user.id)
        db.add(settings)
    
    # Update model if provided
    if settings_update.model_id is not None:
        model = await db.query(DBAIModel).filter(
            DBAIModel.id == settings_update.model_id,
            DBAIModel.is_available == True
        ).first()
        
        if not model:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Specified model is not available"
            )
            
        settings.model_id = model.id
        settings.last_upgraded_at = datetime.utcnow()
    
    # Update auto-upgrade setting
    if settings_update.is_auto_upgrade is not None:
        settings.is_auto_upgrade = settings_update.is_auto_upgrade
    
    await db.commit()
    await db.refresh(settings)
    return settings

# WebSocket endpoint for real-time notifications
@app.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket, token: str = Query(...)):
    """Handle WebSocket connections for real-time notifications."""
    try:
        # Verify the authentication token
        try:
            # This is a simplified example - you should implement proper token validation
            # based on your authentication system
            payload = jwt.decode(
                token,
                os.getenv("SECRET_KEY"),
                algorithms=["HS256"]
            )
            user_id = payload.get("sub")
            if not user_id:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
        except JWTError:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
            
        # Generate a unique client ID for this connection
        client_id = str(uuid.uuid4())
        
        # Connect the WebSocket
        await ws_manager.connect(websocket, client_id, user_id)
        
        try:
            # Keep the connection alive and handle incoming messages
            while True:
                data = await websocket.receive_text()
                try:
                    message = json.loads(data)
                    # Handle ping/pong for keeping the connection alive
                    if message.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})
                    
                    # Handle other message types here if needed
                    
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON received from {client_id}")
                    
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected: {client_id}")
        finally:
            ws_manager.disconnect(client_id, user_id)
            
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.close()
        except:
            pass

# Include task router
app.include_router(
    task_endpoints.router,
    prefix="/api/v1",
    tags=["tasks"],
    dependencies=[Depends(verify_firebase_token)]
)

# Import and configure rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.RATE_LIMIT],
    storage_uri="memory://",
)

# Add rate limiting to the app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Import and include all API routers
from .api import routers as api_routers
from .api.test_video_endpoint import router as test_video_router
from .api.endpoints import payments as payments_router
from .api.endpoints import notes as notes_router
from .api.routers import audio_notes

# Import API v1 router
from .api.v1 import api_router as v1_router

# Include all API routers
for router in api_routers:
    app.include_router(router)

# Include API v1 router with version prefix
app.include_router(v1_router, prefix="/api/v1")

# Include other API routers
app.include_router(test_video_router, prefix="/test-video")
app.include_router(payments_router, prefix="/payments", tags=["payments"])
app.include_router(notes_router, prefix=settings.API_V1_STR, tags=["notes"])
app.include_router(audio_notes.router, prefix=settings.API_V1_STR, tags=["audio-notes"])

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "http://localhost:5173",  # Vite default port
        "https://notefusion-frontend.onrender.com",  # Production frontend
        "https://*.onrender.com"  # All Render subdomains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_headers=["*"],
)

# Startup event to initialize background tasks
@app.on_event("startup")
async def startup_event():
    """Initialize application services on startup."""
    # Start the model update background task
    asyncio.create_task(start_model_update_task())
    logger.info("Background tasks started")

# Initialize services
transcription_service = TranscriptionService()
pdf_service = PDFService()
fusion_service = FusionService(os.getenv("OPENAI_API_KEY"))

# Add API key authentication to protected endpoints
protected_endpoints = [
    "/api/v1/notes",
    "/api/v1/transcribe",
    "/api/v1/generate",
    "/api/v1/export"
]

# Apply rate limiting to all endpoints
for route in app.routes:
    if hasattr(route, "path") and any(route.path.startswith(ep) for ep in protected_endpoints):
        route.dependencies.append(Depends(RateLimiter(1000, 60)))  # 1000 requests per minute

# Pydantic models
class GenerateNotesRequest(BaseModel):
    lecture_text: str
    textbook_text: Optional[str] = None
    module_code: Optional[str] = None
    chapter: Optional[str] = None
    detail_level: str = "standard"
    table_of_contents: Optional[str] = None  # New: user-provided TOC
    lecture_timestamps: Optional[str] = None  # New: user-provided timestamps

class SessionCreate(BaseModel):
    title: str
    module_code: Optional[str] = None
    chapter: Optional[str] = None

@app.post("/api/upload/audio")
async def upload_audio(
    request: Request,
    file: UploadFile = File(...), 
    diarize: bool = False,
    user = Depends(verify_firebase_token)
):
    """Handle audio file upload and transcription"""
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
        
        result = await transcription_service.transcribe_audio(temp_path, diarize)
        os.remove(temp_path)
        return result
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload/pdf")
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...), 
    pages: Optional[List[int]] = None,
    user = Depends(verify_firebase_token)
):
    """Handle PDF file upload and text extraction"""
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
        
        result = await pdf_service.extract_text(temp_path, pages)
        os.remove(temp_path)
        return result
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/notes/generate")
async def generate_notes(
    request: GenerateNotesRequest,
    user = Depends(verify_firebase_token)
):
    """Generate fused notes from lecture and textbook content"""
    try:
        result = await fusion_service.fuse_content(
            request.lecture_text,
            request.textbook_text,
            request.module_code,
            request.chapter,
            request.detail_level,
            table_of_contents=request.table_of_contents,
            lecture_timestamps=request.lecture_timestamps
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/audio")
async def websocket_audio(websocket: WebSocket):
    # Note: WebSocket endpoints handle authentication differently
    # You'll need to implement token verification in the WebSocket handler
    """Handle live audio streaming and transcription"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_bytes()
            result = await transcription_service.transcribe_chunk(data)
            await websocket.send_json(result)
    except Exception as e:
        await websocket.close(code=1000, reason=str(e))

@app.post("/api/export/pdf")
async def export_pdf(
    content: dict,
    user = Depends(verify_firebase_token)
):
    """Export notes to PDF with diagrams"""
    try:
        pdf_bytes = await pdf_service.export_to_pdf(
            content.get("markdown", ""),
            content.get("diagrams", [])
        )
        if not pdf_bytes:
            raise HTTPException(status_code=500, detail="PDF generation failed")
        return pdf_bytes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
