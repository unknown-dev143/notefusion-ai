"""
Rate limiting utilities for API endpoints.
"""
from functools import lru_cache
from typing import Optional

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status

from app.config.audio_config import audio_settings

# Create rate limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{audio_settings.RATE_LIMIT_REQUESTS} per {audio_settings.RATE_LIMIT_PERIOD} seconds"]
)

def get_rate_limiter():
    """Get the rate limiter instance."""
    return limiter

def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Custom rate limit exceeded handler."""
    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail={
            "error": "Rate limit exceeded",
            "message": f"Too many requests. Please try again in {exc.retry_after} seconds.",
            "retry_after": exc.retry_after,
            "limit": request.state.rate_limit.limit,
            "remaining": request.state.rate_limit.remaining,
        },
        headers={"Retry-After": str(exc.retry_after)},
    )

# Apply rate limiting to specific routes with custom limits
rate_limited = limiter.shared_limit(
    f"{audio_settings.RATE_LIMIT_REQUESTS} per {audio_settings.RATE_LIMIT_PERIOD} seconds"
)
