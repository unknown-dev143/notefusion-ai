from fastapi import FastAPI, UploadFile, File, WebSocket, HTTPException, BackgroundTasks, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import os
import json
from jose import jwt, JWTError
from datetime import datetime, timedelta
import httpx
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Import application components
from .config import settings
from .services.transcription.service import TranscriptionService
from .services.pdf.service import PDFService
from .services.fusion.service import FusionService
from .services.model_update_service import ModelUpdateService
from .models.user import User
from .models.ai_models import DBAIModel, UserAIModelSettings, AIProvider, AIModelStatus
from .models.database import SessionLocal, Base, get_db
from .schemas.ai_models import UserAIModelSettings as UserAIModelSettingsSchema

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for NoteFusion AI",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Security
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

# Database session dependency
async def get_db():
    from .models.database import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()

# Authentication dependency
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Get user from database
    db = next(get_db())
    user = await db.get(User, int(user_id))
    if user is None:
        raise credentials_exception
    return user

# Mount static files
app.mount("/static", StaticFiles(directory=settings.UPLOAD_FOLDER), name="static")

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware)

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

# Import and include all API routers
from .api import routers as api_routers
from .api.test_video_endpoint import router as test_video_router

# Include all API routers
for router in api_routers:
    app.include_router(router)

# Include test video endpoints (for development only)
app.include_router(test_video_router, prefix="/api/v1")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
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
