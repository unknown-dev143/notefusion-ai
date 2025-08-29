"""
Security-related middleware and utilities.
"""
from fastapi import Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send

# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware for adding security headers to all responses."""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), payment=()"
        )
        
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; "
            "style-src 'self' 'unsafe-inline' https:; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https: wss:; "
            "frame-ancestors 'none'; "
            "form-action 'self'; "
            "base-uri 'self'; "
            "object-src 'none'"
        )
        response.headers["Content-Security-Policy"] = csp
        
        # Feature Policy (for older browsers)
        response.headers["Feature-Policy"] = (
            "accelerometer 'none'; "
            "camera 'none'; "
            "geolocation 'none'; "
            "gyroscope 'none'; "
            "magnetometer 'none'; "
            "microphone 'none'; "
            "payment 'none'; "
            "usb 'none'"
        )
        
        # HSTS (only in production)
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        return response

# CORS configuration
def setup_cors(app: ASGIApp) -> None:
    """Configure CORS middleware."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://your-production-domain.com"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=[
            "Content-Range",
            "X-Total-Count",
            "X-RateLimit-Limit",
            "X-RateLimit-Remaining",
            "X-RateLimit-Reset"
        ],
        max_age=600,  # 10 minutes
    )

# Trusted hosts configuration
def setup_trusted_hosts(app: ASGIApp) -> None:
    """Configure trusted hosts middleware."""
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "localhost",
            "127.0.0.1",
            "your-production-domain.com",
            ".your-production-domain.com"  # Allow all subdomains
        ]
    )

# Rate limiting headers
class RateLimitHeaders:
    """Add rate limit headers to responses."""
    
    def __init__(self, app: ASGIApp):
        self.app = app
    
    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        async def send_with_headers(message):
            if message["type"] == "http.response.start":
                # Add rate limit headers if they exist in the request state
                if hasattr(scope["app"].state, "rate_limit"):
                    rate_limit = scope["app"].state.rate_limit
                    headers = message.get("headers", [])
                    
                    if hasattr(rate_limit, "limit"):
                        headers.append((b"X-RateLimit-Limit", str(rate_limit.limit).encode()))
                    if hasattr(rate_limit, "remaining"):
                        headers.append((b"X-RateLimit-Remaining", str(rate_limit.remaining).encode()))
                    if hasattr(rate_limit, "reset"):
                        headers.append((b"X-RateLimit-Reset", str(rate_limit.reset).encode()))
                    
                    message["headers"] = headers
            
            await send(message)
        
        await self.app(scope, receive, send_with_headers)

# Request ID middleware
class RequestIDMiddleware:
    """Add a unique request ID to each request."""
    
    def __init__(self, app: ASGIApp):
        self.app = app
    
    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        import uuid
        request_id = str(uuid.uuid4())
        
        async def send_with_request_id(message):
            if message["type"] == "http.response.start":
                headers = message.get("headers", [])
                headers.append((b"X-Request-ID", request_id.encode()))
                message["headers"] = headers
            
            await send(message)
        
        # Store the request ID in the scope for logging
        scope["state"].request_id = request_id
        
        await self.app(scope, receive, send_with_request_id)
