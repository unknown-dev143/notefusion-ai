"""Application configuration and middleware setup"""
import logging
from fastapi import FastAPI, Request, Response
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.types import ASGIApp
from typing import Dict, List, Optional, Callable, Awaitable

from .security_config import get_security_settings
from .security_middleware import SecurityMiddleware
from .security.rate_limiter import RateLimiter
from .security.audit_logger import AuditLogger, AuditEvent, AuditEventType

logger = logging.getLogger(__name__)

# Get security settings
security_settings = get_security_settings()

# Initialize security components
audit_logger = AuditLogger()
rate_limiter = RateLimiter()

def setup_middleware(app: FastAPI) -> None:
    """Set up all application middleware"""
    # Add security middleware (includes headers, rate limiting, etc.)
    app.add_middleware(SecurityMiddleware)
    
    # CORS Configuration
    origins = [origin.strip() for origin in security_settings.CORS_ORIGINS.split(",") if origin.strip()]
    
    # Add default origins if none specified
    if not origins:
        origins = [
            "http://localhost:3000",
            "http://localhost:8000",
            "https://notefusion-ai.vercel.app"
        ]
    
    logger.info(f"Configuring CORS with allowed origins: {origins}")
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Range", "X-Total-Count"],
        max_age=600,  # Cache preflight requests for 10 minutes
    )
    
    # Add GZip compression (only for responses > 1KB)
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Add Trusted Hosts middleware
    if security_settings.ALLOWED_HOSTS:
        app.add_middleware(
            TrustedHostMiddleware, 
            allowed_hosts=security_settings.ALLOWED_HOSTS
        )
    
    # Add request timing middleware
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next) -> Response:
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
    
    # Add security headers middleware
    @app.middleware("http")
    async def security_headers_middleware(request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = security_settings.X_CONTENT_TYPE_OPTIONS
        response.headers["X-Frame-Options"] = security_settings.X_FRAME_OPTIONS
        response.headers["X-XSS-Protection"] = security_settings.X_XSS_PROTECTION
        response.headers["Referrer-Policy"] = security_settings.SECURE_REFERRER_POLICY
        response.headers["Permissions-Policy"] = security_settings.PERMISSIONS_POLICY
        
        # HSTS header (only over HTTPS)
        if request.url.scheme == "https":
            hsts_value = f"max-age={security_settings.SECURE_HSTS_SECONDS}"
            if security_settings.SECURE_HSTS_INCLUDE_SUBDOMAINS:
                hsts_value += "; includeSubDomains"
            if security_settings.SECURE_HSTS_PRELOAD:
                hsts_value += "; preload"
            response.headers["Strict-Transport-Security"] = hsts_value
        
        return response
    
    # Add audit logging middleware
    @app.middleware("http")
    async def audit_log_middleware(request: Request, call_next) -> Response:
        # Skip logging for health checks and monitoring endpoints
        if request.url.path in ["/health", "/metrics", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
            
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "")
        
        # Log request
        await audit_logger.log_event(
            AuditEvent(
                event_type=AuditEventType.API_CALL,
                ip_address=client_ip,
                user_agent=user_agent,
                resource_type=request.method,
                resource_id=request.url.path,
                status="started",
                details={
                    "method": request.method,
                    "url": str(request.url),
                },
            )
        )
        
        # Process request
        try:
            start_time = time.time()
            response = await call_next(request)
            processing_time = time.time() - start_time
            
            # Log response
            await audit_logger.log_event(
                AuditEvent(
                    event_type=AuditEventType.API_CALL,
                    ip_address=client_ip,
                    user_agent=user_agent,
                    resource_type=request.method,
                    resource_id=request.url.path,
                    status="completed",
                    details={
                        "status_code": response.status_code,
                        "processing_time": processing_time,
                    },
                )
            )
            
            return response
            
        except Exception as e:
            # Log error
            await audit_logger.log_event(
                AuditEvent(
                    event_type=AuditEventType.SECURITY_EVENT,
                    ip_address=client_ip,
                    user_agent=user_agent,
                    resource_type=request.method,
                    resource_id=request.url.path,
                    status="error",
                    details={
                        "error": str(e),
                        "error_type": e.__class__.__name__,
                    },
                )
            )
            raise
    
    logger.info("Middleware setup complete")

def create_app(lifespan=None) -> FastAPI:
    """Create and configure the FastAPI application
    
    Args:
        lifespan: Optional lifespan context manager for the FastAPI app
    """
    # Initialize FastAPI app
    app_kwargs = {
        "title": security_settings.APP_NAME,
        "title": settings.APP_NAME,
        "description": "NoteFusion AI Backend API",
        "version": settings.APP_VERSION,
        "docs_url": "/docs" if settings.DEBUG else None,
        "redoc_url": "/redoc" if settings.DEBUG else None,
        "openapi_url": "/openapi.json" if settings.DEBUG else None,
    }
    
    # Add lifespan if provided
    if lifespan is not None:
        app_kwargs["lifespan"] = lifespan
        
    app = FastAPI(**app_kwargs)
    
    # Set up middleware
    setup_middleware(app)
    
    # Set up monitoring
    setup_monitoring(app)
    
    # Add startup and shutdown event handlers
    @app.on_event("startup")
    async def startup():
        """Run on application startup"""
        logger.info("Starting application...")
        
        # Initialize database connection pool
        await database.connect()
        logger.info("Database connection pool initialized")
        
        # Additional startup tasks can be added here
        
        logger.info("Application startup complete")
    
    @app.on_event("shutdown")
    async def shutdown():
        """Run on application shutdown"""
        logger.info("Shutting down application...")
        
        # Close database connections
        await database.disconnect()
        logger.info("Database connections closed")
        
        # Additional cleanup tasks can be added here
        
        logger.info("Application shutdown complete")
    
    # Include routers
    from app.api.v1 import api_router
    app.include_router(api_router, prefix="/api/v1")
    
    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        return {"status": "ok"}
    
    return app
