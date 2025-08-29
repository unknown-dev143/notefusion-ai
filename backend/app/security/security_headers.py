"""
Security headers middleware for FastAPI.

This module provides middleware to add security-related HTTP headers to responses.
"""
from typing import Callable, Dict, List, Optional
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp, Receive, Scope, Send

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to responses."""
    
    def __init__(
        self, 
        app: ASGIApp,
        csp_directives: Optional[Dict[str, List[str]]] = None,
        feature_policy: Optional[Dict[str, List[str]]] = None,
        permissions_policy: Optional[Dict[str, List[str]]] = None,
        **custom_headers: str
    ) -> None:
        """Initialize the security headers middleware.
        
        Args:
            app: The ASGI application
            csp_directives: Content Security Policy directives
            feature_policy: Feature-Policy header directives (legacy)
            permissions_policy: Permissions-Policy header directives
            **custom_headers: Additional custom headers to add
        """
        super().__init__(app)
        self.custom_headers = custom_headers
        
        # Default CSP directives if not provided
        if csp_directives is None:
            csp_directives = {
                "default-src": ["'self'"],
                "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                "style-src": ["'self'", "'unsafe-inline'"],
                "img-src": ["'self'", "data:", "https:"],
                "connect-src": ["'self'"],
                "font-src": ["'self'", "data:"],
                "object-src": ["'none'"],
                "frame-ancestors": ["'self'"],
                "base-uri": ["'self'"],
                "form-action": ["'self'"],
            }
        
        # Format CSP header
        csp_parts = []
        for directive, sources in csp_directives.items():
            csp_parts.append(f"{directive} {' '.join(sources)}")
        
        self.csp = "; ".join(csp_parts)
        
        # Default security headers
        self.security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": self.csp,
            "Permissions-Policy": (
                "accelerometer=(), camera=(), geolocation=(), "
                "gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
            ),
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Resource-Policy": "same-site",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        }
        
        # Add custom headers
        self.security_headers.update(self.custom_headers)
    
    async def dispatch(
        self, 
        request: Request, 
        call_next: RequestResponseEndpoint
    ) -> Response:
        """Process the request and add security headers to the response."""
        response = await call_next(request)
        
        # Don't add headers to error responses
        if 400 <= response.status_code < 600:
            return response
            
        # Add security headers
        for header, value in self.security_headers.items():
            response.headers[header] = value
            
        return response

# Helper function to create a CSP nonce
def create_csp_nonce() -> str:
    """Generate a random nonce for CSP."""
    import secrets
    import base64
    return base64.b64encode(secrets.token_bytes(16)).decode('utf-8')

def get_csp_nonce(request: Request) -> str:
    """Get or create a CSP nonce for the current request."""
    if not hasattr(request.state, 'csp_nonce'):
        request.state.csp_nonce = create_csp_nonce()
    return request.state.csp_nonce
