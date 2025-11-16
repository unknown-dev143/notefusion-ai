"""Security middleware for AI-related endpoints."""
import re
from typing import Callable, Optional
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
import html

class AISecurityMiddleware:
    """Middleware for securing AI-related endpoints."""
    
    def __init__(self, app):
        self.app = app
        self.sensitive_patterns = [
            r'\b(?:password|secret|api[_-]?key|token|auth|credential)[\s=:]+[\w-]',
            r'\b(?:bearer|basic|oauth)[\s:]+[\w.-]',
            r'\b(?:https?:\/\/)[\w.-]+\.[a-z]{2,}(?:\/\S*)?',
            r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
            r'\b(?:[a-f0-9]{32,}|[a-f0-9]{40,}|[a-f0-9]{64,})\b',
        ]
        
    async def __call__(self, request: Request, call_next):
        # Skip security checks for non-AI endpoints
        if not request.url.path.startswith("/api/v1/ai"):
            return await call_next(request)
            
        try:
            # Check for suspicious input patterns
            if request.method in ["POST", "PUT"]:
                body = await request.body()
                if body:
                    body_str = body.decode('utf-8', errors='ignore')
                    self._check_sensitive_data(body_str)
            
            # Add security headers
            response = await call_next(request)
            self._add_security_headers(response)
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Invalid request"}
            )
    
    def _check_sensitive_data(self, text: str) -> None:
        """Check for sensitive data patterns in the input."""
        for pattern in self.sensitive_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Request contains potentially sensitive data"
                )
    
    def _add_security_headers(self, response):
        """Add security headers to the response."""
        headers = {
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
        }
        
        for key, value in headers.items():
            response.headers[key] = value

class AIRequestValidator(BaseModel):
    """Base model for validating AI requests."""
    text: str
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7
    
    @validator('text', pre=True)
    def validate_text(cls, v):
        if not v or not v.strip():
            raise ValueError("Text cannot be empty")
        if len(v) > 10000:  # Limit input size
            raise ValueError("Text is too long")
        return html.escape(v)  # Basic XSS protection
    
    @validator('max_tokens')
    def validate_max_tokens(cls, v):
        if v > 4000:  # Prevent excessive token usage
            raise ValueError("Max tokens exceeds limit")
        return v
    
    @validator('temperature')
    def validate_temperature(cls, v):
        if not 0 <= v <= 2.0:  # Keep temperature in a reasonable range
            raise ValueError("Temperature must be between 0 and 2")
        return v
