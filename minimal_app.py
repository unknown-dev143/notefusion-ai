import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import List, Optional, AsyncGenerator
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import models and database
from app.models import user, note
from app.core.database import engine, Base, get_db
from sqlalchemy.ext.asyncio import AsyncSession

# Import routers
from app.routers import users, auth, notes

# Initialize FastAPI app with metadata
app = FastAPI(
    title="NoteFusion AI API",
    description="Backend API for NoteFusion AI application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:8000",
    "https://notefusion-ai.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(notes.router, prefix="/api/v1/notes", tags=["Notes"])

# API Routes
@app.get("/")
async def read_root():
    return {"message": "Welcome to NoteFusion AI API"}

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
    }

# Error Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

# Application Startup Event
@app.on_event("startup")
async def startup_event():
    """Initialize application services on startup"""
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)

# Application Shutdown Event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup application state on shutdown"""
    # SQLAlchemy handles connection cleanup
    pass

if __name__ == "__main__":
    uvicorn.run(
        "minimal_app:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 5000)),
        reload=os.getenv("ENVIRONMENT") == "development",
        workers=int(os.getenv("WORKERS", 1)),
    )
