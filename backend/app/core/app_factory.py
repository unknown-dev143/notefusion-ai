"""Application factory for creating and configuring the FastAPI app."""
from fastapi import FastAPI, Request, status
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from typing import List, Optional, Callable, Awaitable
import logging
import os
from pathlib import Path

from .logging_config import setup_logging
from .cors import setup_cors
from .security_headers import SecurityHeadersMiddleware, setup_trusted_hosts
from .error_handlers import setup_error_handlers
from .rate_limiter import limiter, rate_limit_exceeded_handler

logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    # Setup logging first
    setup_logging()
    
    # Initialize FastAPI with metadata
    app = FastAPI(
        title="NoteFusion AI API",
        description="API for NoteFusion AI application with API key authentication and rate limiting",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )
    
    # Setup CORS
    setup_cors(app)
    
    # Setup trusted hosts
    setup_trusted_hosts(app)
    
    # Add security headers middleware
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Add GZip compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Add rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(429, rate_limit_exceeded_handler)
    
    # Setup error handlers
    setup_error_handlers(app)
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True, parents=True)
    
    # Mount static files
    app.mount("/static", StaticFiles(directory=str(upload_dir)), name="static")
    
    # Add health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {
            "status": "healthy",
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "development")
        }
    
    # Add startup and shutdown event handlers
    @app.on_event("startup")
    async def startup():
        """Run startup events."""
        logger.info("Starting up application...")
        # Any additional startup code here
    
    @app.on_event("shutdown")
    async def shutdown():
        """Run shutdown events."""
        logger.info("Shutting down application...")
        # Any cleanup code here
    
    return app
