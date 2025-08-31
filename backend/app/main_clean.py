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
from sqlalchemy.ext.asyncio import AsyncSession

# Import database components
from .models.database_clean import engine, Base, get_db, async_session_factory
from .models.user_clean import User
from .services.transcription.service import TranscriptionService
from .services.pdf.service import PDFService
from .services.fusion.service import FusionService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Starting NoteFusion AI backend...")
    yield
    
    # Clean up resources on shutdown
    await engine.dispose()
    logger.info("Shutting down NoteFusion AI backend...")

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="NoteFusion AI API",
    description="API for NoteFusion AI application",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],  # In production, specify your domain
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Simple health check endpoint
@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "NoteFusion AI API is running",
        "version": "1.0.0"
    }

# Initialize services with database session dependency
async def get_transcription_service():
    async with async_session_factory() as session:
        return TranscriptionService(session)

async def get_pdf_service():
    async with async_session_factory() as session:
        return PDFService(session)

async def get_fusion_service():
    async with async_session_factory() as session:
        return FusionService(os.getenv("OPENAI_API_KEY"), session)

# Dependency to get services
async def get_services(
    db: AsyncSession = Depends(get_db),
):
    return {
        'transcription': TranscriptionService(db),
        'pdf': PDFService(db),
        'fusion': FusionService(os.getenv("OPENAI_API_KEY"), db),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main_clean:app", host="0.0.0.0", port=8000, reload=True)
