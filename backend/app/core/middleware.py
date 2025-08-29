"""Security middleware for the application."""
import time
from typing import Callable, Dict, List, Optional, Tuple

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp

from ..config import settings

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to all responses."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
        
        # HSTS header (only in production with HTTPS)
        if settings.ENV == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

class RateLimitMiddleware:
    """Rate limiting middleware using slowapi."""
    
    def __init__(self, app: FastAPI):
        self.app = app
        
        # Initialize rate limiter
        self.limiter = Limiter(
            key_func=get_remote_address,
            default_limits=[settings.RATE_LIMIT],
            storage_uri="memory://",
        )
        
        # Add rate limit exceeded handler
        self.app.state.limiter = self.limiter
        self.app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    async def __call__(self, scope, receive, send):
        # Only apply rate limiting to HTTP requests
        if scope["type"] == "http":
            request = Request(scope, receive)
            
            # Skip rate limiting for certain paths (e.g., health checks)
            if not request.url.path.startswith("/api"):
                return await self.app(scope, receive, send)
                
            # Apply rate limiting
            endpoint = f"{request.method}:{request.url.path}"
            
            @self.limiter.limit(settings.RATE_LIMIT, key_func=lambda: endpoint)
            async def endpoint_wrapper():
                return await self.app(scope, receive, send)
                
            try:
                return await endpoint_wrapper()
            except RateLimitExceeded as e:
                response = Response(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Too many requests"},
                    media_type="application/json"
                )
                await response(scope, receive, send)
                return
        
        return await self.app(scope, receive, send)

def setup_cors(app: FastAPI) -> None:
    """Configure CORS middleware with secure defaults."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["Content-Range", "X-Total-Count"],
        max_age=600,  # 10 minutes
    )

def setup_security_middleware(app: FastAPI) -> None:
    """Set up all security-related middleware."""
    # Add security headers
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Add rate limiting
    RateLimitMiddleware(app)
    
    # Add CORS
    setup_cors(app)
    
    # Add other security middleware as needed
    # e.g., app.add_middleware(SecureCookiesMiddleware)
