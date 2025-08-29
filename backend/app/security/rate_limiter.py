"""
Rate limiting functionality for API endpoints.

This module provides rate limiting capabilities using Redis as the backend.
"""
import time
from typing import Optional, Dict, Any, Callable, Awaitable
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from functools import wraps
import redis.asyncio as redis
from ..core.config import settings

class RateLimiter:
    """Rate limiter using Redis as the backend."""
    
    def __init__(self, redis_client: redis.Redis, prefix: str = "rate_limit:"):
        """Initialize the rate limiter.
        
        Args:
            redis_client: Redis client instance
            prefix: Prefix for Redis keys
        """
        self.redis = redis_client
        self.prefix = prefix
    
    async def is_rate_limited(
        self, 
        key: str, 
        limit: int, 
        window: int = 60
    ) -> bool:
        """Check if a request should be rate limited.
        
        Args:
            key: The key to rate limit on (e.g., IP address or user ID)
            limit: Maximum number of requests allowed in the time window
            window: Time window in seconds
            
        Returns:
            bool: True if rate limited, False otherwise
        """
        current = int(time.time())
        window_start = current - window
        
        # Use Redis pipeline for atomic operations
        async with self.redis.pipeline() as pipe:
            try:
                # Add current timestamp to sorted set
                pipe.zadd(f"{self.prefix}{key}", {current: current})
                # Remove old timestamps
                pipe.zremrangebyscore(f"{self.prefix}{key}", 0, window_start)
                # Get count of requests in current window
                pipe.zcard(f"{self.prefix}{key}")
                # Set expiry on the key
                pipe.expire(f"{self.prefix}{key}", window)
                
                # Execute all commands
                _, _, count, _ = await pipe.execute()
                
                return count > limit
                
            except redis.RedisError as e:
                # If Redis is down, fail open (don't rate limit)
                print(f"Redis error in rate limiter: {e}")
                return False

def get_limiter() -> RateLimiter:
    """Get a rate limiter instance."""
    redis_client = redis.Redis.from_url(settings.REDIS_URL)
    return RateLimiter(redis_client)

def rate_limit(
    limit: int = 100, 
    window: int = 60,
    key_func: Optional[Callable[[Request], str]] = None
):
    """Decorator to rate limit API endpoints.
    
    Args:
        limit: Maximum number of requests allowed in the time window
        window: Time window in seconds
        key_func: Function to generate the rate limit key from the request
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            # Default key function uses client IP
            if key_func is None:
                client_ip = request.client.host if request.client else "unknown"
                key = f"ip:{client_ip}:{request.url.path}"
            else:
                key = key_func(request)
            
            # Check rate limit
            limiter = get_limiter()
            is_limited = await limiter.is_rate_limited(
                key=key,
                limit=limit,
                window=window
            )
            
            if is_limited:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Too many requests. Please try again later."},
                    headers={"Retry-After": str(window)}
                )
                
            return await func(request, *args, **kwargs)
            
        return wrapper
    
    return decorator
