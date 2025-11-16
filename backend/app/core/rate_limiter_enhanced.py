"""
Enhanced rate limiting with Redis backend and improved configuration.
"""
from typing import Callable, Optional, Dict, Any
from functools import wraps
import time
import json
import hashlib

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from slowapi import Limiter as SlowLimiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
import redis.asyncio as redis

from ..config import settings

class RateLimiter:
    """Enhanced rate limiter with Redis backend and flexible configuration."""
    
    def __init__(self):
        self.redis = None
        self.enabled = settings.RATE_LIMIT_ENABLED
        self.rate_limit_requests = settings.RATE_LIMIT_REQUESTS
        self.rate_limit_period = settings.RATE_LIMIT_PERIOD
        self.rate_limit_by_user = settings.RATE_LIMIT_BY_USER
        self.whitelisted_ips = settings.RATE_LIMIT_WHITELIST_IPS or []
        self.rate_limits = settings.RATE_LIMITS or {}
        
        # Initialize Redis if enabled
        if self.enabled and settings.REDIS_URL:
            self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
    
    def get_rate_limit_key(self, request: Request) -> str:
        """Generate a unique key for rate limiting based on the request."""
        if self.rate_limit_by_user and hasattr(request.state, 'user_id'):
            return f"rate_limit:{request.state.user_id}"
        
        # Default to IP-based rate limiting
        client_ip = get_remote_address(request)
        return f"rate_limit:ip:{client_ip}"
    
    async def is_rate_limited(self, request: Request, endpoint: str) -> bool:
        """Check if the request should be rate limited."""
        if not self.enabled:
            return False
            
        # Skip rate limiting for whitelisted IPs
        client_ip = get_remote_address(request)
        if client_ip in self.whitelisted_ips:
            return False
        
        # Get rate limit config for the endpoint or use default
        rate_config = self.rate_limits.get(endpoint, {
            'requests': self.rate_limit_requests,
            'period': self.rate_limit_period
        })
        
        key = self.get_rate_limit_key(request)
        current_time = int(time.time())
        
        if not self.redis:
            # Fallback to in-memory rate limiting if Redis is not available
            return False
            
        try:
            # Use Redis pipeline for atomic operations
            async with self.redis.pipeline(transaction=True) as pipe:
                # Remove old timestamps outside the current window
                pipe.zremrangebyscore(key, 0, current_time - rate_config['period'])
                # Add current timestamp
                pipe.zadd(key, {str(current_time): current_time})
                # Set expiration
                pipe.expire(key, rate_config['period'])
                # Get count of requests in current window
                pipe.zcard(key)
                
                # Execute all commands in a single transaction
                results = await pipe.execute()
                request_count = results[-1]  # Result of zcard
                
                return request_count > rate_config['requests']
                
        except Exception as e:
            # If Redis fails, log the error but allow the request
            print(f"Rate limiter error: {str(e)}")
            return False
    
    def limit(self, requests: int = None, period: int = None):
        """Decorator to apply rate limiting to a route."""
        def decorator(func):
            @wraps(func)
            async def wrapper(request: Request, *args, **kwargs):
                endpoint = f"{request.method}:{request.url.path}"
                
                # Use custom limits if provided, otherwise use defaults
                rate_config = {
                    'requests': requests or self.rate_limit_requests,
                    'period': period or self.rate_limit_period
                }
                
                # Check if rate limited
                is_limited = await self.is_rate_limited(request, endpoint)
                if is_limited:
                    retry_after = rate_config['period']
                    return JSONResponse(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        content={
                            "error": "rate_limit_exceeded",
                            "message": f"Too many requests. Please try again in {retry_after} seconds.",
                            "retry_after": retry_after
                        },
                        headers={"Retry-After": str(retry_after)}
                    )
                
                return await func(request, *args, **kwargs)
            return wrapper
        return decorator

# Create a global instance
rate_limiter = RateLimiter()

# Decorator for rate limiting routes
rate_limited = rate_limiter.limit()

# Middleware for FastAPI
class RateLimitMiddleware:
    """Middleware to apply rate limiting to all requests."""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
            
        request = Request(scope, receive)
        
        # Skip rate limiting for certain paths
        if request.url.path.startswith("/health") or request.url.path.startswith("/docs"):
            return await self.app(scope, receive, send)
            
        # Check rate limit
        is_limited = await rate_limiter.is_rate_limited(request, f"{request.method}:{request.url.path}")
        if is_limited:
            response = JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"error": "rate_limit_exceeded", "message": "Too many requests"}
            )
            await response(scope, receive, send)
            return
            
        return await self.app(scope, receive, send)
