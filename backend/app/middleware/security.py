from fastapi import Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp
import time
import logging
from typing import List, Optional, Dict, Any, Callable, Awaitable
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware for adding security headers to responses"""
    
    def __init__(
        self,
        app: ASGIApp,
        headers: Optional[Dict[str, str]] = None,
    ) -> None:
        super().__init__(app)
        self.headers = headers or self._get_default_headers()
    
    @staticmethod
    def _get_default_headers() -> Dict[str, str]:
        """Return default security headers"""
        return {
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        }
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        response = await call_next(request)
        
        # Add security headers to the response
        for header, value in self.headers.items():
            response.headers[header] = value
            
        return response

class RateLimiterMiddleware:
    """Rate limiting middleware using slowapi"""
    
    def __init__(self, app: ASGIApp, rate_limit: str = "100/minute"):
        self.app = app
        self.limiter = Limiter(key_func=get_remote_address, default_limits=[rate_limit])
        
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive=receive)
            
            # Skip rate limiting for certain paths
            if not self._should_rate_limit(request):
                return await self.app(scope, receive, send)
                
            # Check rate limit
            try:
                # This is a simplified version - in practice, you'd use the limiter
                # to check and increment the rate limit counter
                await self.limiter.check(request)
            except RateLimitExceeded:
                raise HTTPException(status_code=429, detail="Too many requests")
                
        return await self.app(scope, receive, send)
    
    def _should_rate_limit(self, request: Request) -> bool:
        """Determine if the request should be rate limited"""
        # Skip rate limiting for health checks and static files
        skip_paths = ["/health", "/metrics", "/static/"]
        return not any(request.url.path.startswith(path) for path in skip_paths)

def setup_security_middleware(app: ASGIApp, **kwargs):
    """Set up all security-related middleware"""
    
    # Get CORS origins from settings
    cors_origins = [origin.strip() for origin in kwargs.get("cors_origins", "").split(",") if origin.strip()]
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition"],
    )
    
    # Add security headers middleware
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Add rate limiting
    rate_limit = kwargs.get("rate_limit", "100/minute")
    app.add_middleware(RateLimiterMiddleware, rate_limit=rate_limit)
    
    # Add GZip compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Add trusted hosts middleware
    allowed_hosts = kwargs.get("allowed_hosts", ["*"])
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)
    
    logger.info("Security middleware initialized")
    return app
