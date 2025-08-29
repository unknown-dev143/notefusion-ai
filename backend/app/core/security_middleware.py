"""Security middleware for the application."""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp
from typing import Dict, List, Optional, Callable, Awaitable, Any
import time
import json
import logging

from .security_config import get_security_settings
from .security.rate_limiter import RateLimiter, rate_limit
from .security.security_headers import SecurityHeadersMiddleware
from .security.audit_logger import AuditLogger, AuditEvent, AuditEventType

logger = logging.getLogger(__name__)

class SecurityMiddleware(BaseHTTPMiddleware):
    """Main security middleware that composes all security features."""
    
    def __init__(
        self,
        app: ASGIApp,
        security_settings: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> None:
        """Initialize the security middleware.
        
        Args:
            app: The ASGI application
            security_settings: Security settings dictionary
            **kwargs: Additional keyword arguments
        """
        super().__init__(app)
        self.settings = security_settings or get_security_settings()
        
        # Initialize security components
        self.audit_logger = AuditLogger()
        self.rate_limiter = RateLimiter()
        self.security_headers = SecurityHeadersMiddleware(
            app,
            csp_directives=self._get_csp_directives(),
            **self._get_security_headers()
        )
    
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """Process the request and apply security measures."""
        # Log the request for auditing
        await self._log_request(request)
        
        # Apply rate limiting
        if not await self._check_rate_limit(request):
            return Response(
                status_code=429,
                content=json.dumps({"detail": "Too many requests"}),
                media_type="application/json"
            )
        
        # Process the request
        start_time = time.time()
        
        try:
            # Add security headers
            response = await self.security_headers.dispatch(request, call_next)
            
            # Log the response
            await self._log_response(request, response, start_time)
            
            return response
            
        except Exception as e:
            # Log the error
            await self._log_error(request, e)
            raise
    
    async def _log_request(self, request: Request) -> None:
        """Log the incoming request for auditing."""
        try:
            client_ip = request.client.host if request.client else "unknown"
            user_agent = request.headers.get("user-agent", "")
            
            await self.audit_logger.log_event(
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
                        "headers": dict(request.headers),
                    },
                )
            )
        except Exception as e:
            logger.error(f"Failed to log request: {e}", exc_info=True)
    
    async def _log_response(
        self, request: Request, response: Response, start_time: float
    ) -> None:
        """Log the outgoing response for auditing."""
        try:
            client_ip = request.client.host if request.client else "unknown"
            user_agent = request.headers.get("user-agent", "")
            processing_time = time.time() - start_time
            
            await self.audit_logger.log_event(
                AuditEvent(
                    event_type=AuditEventType.API_CALL,
                    ip_address=client_ip,
                    user_agent=user_agent,
                    resource_type=request.method,
                    resource_id=request.url.path,
                    status="completed",
                    details={
                        "method": request.method,
                        "url": str(request.url),
                        "status_code": response.status_code,
                        "processing_time": processing_time,
                    },
                )
            )
        except Exception as e:
            logger.error(f"Failed to log response: {e}", exc_info=True)
    
    async def _log_error(self, request: Request, error: Exception) -> None:
        """Log an error that occurred during request processing."""
        try:
            client_ip = request.client.host if request.client else "unknown"
            user_agent = request.headers.get("user-agent", "")
            
            await self.audit_logger.log_event(
                AuditEvent(
                    event_type=AuditEventType.SECURITY_EVENT,
                    ip_address=client_ip,
                    user_agent=user_agent,
                    resource_type=request.method,
                    resource_id=request.url.path,
                    status="error",
                    details={
                        "error": str(error),
                        "error_type": error.__class__.__name__,
                        "method": request.method,
                        "url": str(request.url),
                    },
                )
            )
        except Exception as e:
            logger.error(f"Failed to log error: {e}", exc_info=True)
    
    async def _check_rate_limit(self, request: Request) -> bool:
        """Check if the request should be rate limited."""
        try:
            client_ip = request.client.host if request.client else "unknown"
            endpoint = request.url.path
            
            # Apply different rate limits based on the endpoint
            if endpoint.startswith("/api/auth/"):
                limit = self.settings.AUTH_RATE_LIMIT
            else:
                limit = self.settings.API_RATE_LIMIT
            
            return await self.rate_limiter.is_rate_limited(
                key=f"{client_ip}:{endpoint}",
                limit=limit
            )
            
        except Exception as e:
            logger.error(f"Rate limiting check failed: {e}", exc_info=True)
            # Fail open - don't block requests if rate limiting fails
            return True
    
    def _get_csp_directives(self) -> Dict[str, List[str]]:
        """Get the Content Security Policy directives."""
        return {
            "default-src": ["'self'"],
            "script-src": [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'"  # Only if absolutely necessary
            ],
            "style-src": [
                "'self'",
                "'unsafe-inline'"
            ],
            "img-src": [
                "'self'",
                "data:",
                "https: data:"
            ],
            "connect-src": [
                "'self'",
                "https://*.googleapis.com",
                "https://*.openai.com"
            ],
            "font-src": ["'self'"],
            "object-src": ["'none'"],
            "frame-ancestors": ["'self'"],
            "form-action": ["'self'"],
            "base-uri": ["'self'"],
        }
    
    def _get_security_headers(self) -> Dict[str, Any]:
        """Get security headers configuration."""
        return {
            "x_frame_options": self.settings.X_FRAME_OPTIONS,
            "x_content_type_options": self.settings.X_CONTENT_TYPE_OPTIONS,
            "x_xss_protection": self.settings.X_XSS_PROTECTION,
            "referrer_policy": self.settings.SECURE_REFERRER_POLICY,
            "permissions_policy": self.settings.PERMISSIONS_POLICY,
            "hsts_seconds": self.settings.SECURE_HSTS_SECONDS,
            "hsts_include_subdomains": self.settings.SECURE_HSTS_INCLUDE_SUBDOMAINS,
            "hsts_preload": self.settings.SECURE_HSTS_PRELOAD,
        }
