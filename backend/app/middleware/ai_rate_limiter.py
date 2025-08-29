"""Rate limiting for AI endpoints."""
from datetime import timedelta
from typing import Dict, Optional
from fastapi import Request, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import time

class AIRateLimiter:
    """Rate limiter for AI endpoints with tiered limits."""
    
    def __init__(self):
        # Default rate limits (requests per minute)
        self.default_limit = "60/minute"
        self.tiered_limits = {
            "free": "30/minute",
            "basic": "100/minute",
            "pro": "1000/minute"
        }
        
        # Track request counts
        self.request_counts: Dict[str, Dict[str, int]] = {}
        self.window_size = 60  # 1 minute window in seconds
    
    def get_limit(self, request: Request) -> str:
        """Get rate limit based on user's subscription tier."""
        # In a real app, you'd get this from the user's auth token or session
        user_tier = request.headers.get("X-User-Tier", "free")
        return self.tiered_limits.get(user_tier.lower(), self.default_limit)
    
    async def __call__(self, request: Request, call_next):
        # Only apply to AI endpoints
        if not request.url.path.startswith("/api/v1/ai"):
            return await call_next(request)
        
        client_ip = get_remote_address(request)
        current_time = int(time.time())
        window = current_time // self.window_size
        
        # Initialize request tracking for this window
        if window not in self.request_counts:
            self.request_counts = {window: {}}
        if client_ip not in self.request_counts[window]:
            self.request_counts[window][client_ip] = 0
        
        # Get the limit for this request
        limit = self._parse_limit(self.get_limit(request))
        
        # Check if limit is exceeded
        if self.request_counts[window][client_ip] >= limit:
            retry_after = (window + 1) * self.window_size - current_time
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "rate_limit_exceeded",
                    "message": "Too many requests. Please try again later.",
                    "retry_after": retry_after,
                    "limit": limit,
                    "window": f"{self.window_size}s"
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str((window + 1) * self.window_size)
                }
            )
        
        # Increment request count
        self.request_counts[window][client_ip] += 1
        
        # Add rate limit headers to response
        response = await call_next(request)
        response.headers.update({
            "X-RateLimit-Limit": str(limit),
            "X-RateLimit-Remaining": str(limit - self.request_counts[window][client_ip]),
            "X-RateLimit-Reset": str((window + 1) * self.window_size)
        })
        
        return response
    
    def _parse_limit(self, limit_str: str) -> int:
        """Parse rate limit string (e.g., '60/minute') into number of requests."""
        try:
            count, _, period = limit_str.partition('/')
            count = int(count.strip())
            period = period.strip().lower()
            
            if period == 'second':
                return count * self.window_size
            elif period == 'minute':
                return count
            elif period == 'hour':
                return count // 60
            else:
                return 60  # Default to 1 request per second
        except (ValueError, AttributeError):
            return 60  # Fallback to default

def setup_ai_rate_limiter(app):
    """Set up the AI rate limiter middleware."""
    rate_limiter = AIRateLimiter()
    app.add_middleware(SlowAPIMiddleware)
    app.middleware("http")(rate_limiter)
