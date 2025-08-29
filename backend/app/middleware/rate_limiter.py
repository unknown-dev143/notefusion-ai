from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from typing import Callable, Awaitable
import time

class RateLimiter:
    def __init__(self):
        self.rate_limit = "100/minute"
        self.rate_limits = {
            "/api/v1/ai/": "10/minute",
            "/api/v1/auth/": "20/hour",
            "/api/v1/upload": "5/minute",
            "/api/v1/process": "15/minute",
        }
        self.limiter = Limiter(key_func=get_remote_address)
        
    def get_rate_limit(self, path: str) -> str:
        """Get rate limit for a specific path"""
        for route, limit in self.rate_limits.items():
            if path.startswith(route):
                return limit
        return self.rate_limit
        
    async def __call__(self, request: Request, call_next):
        path = request.url.path
        rate_limit = self.get_rate_limit(path)
        
        try:
            # Check rate limit
            response = await self.limiter.check(request, rate_limit)
            response = await call_next(request)
            return response
            
        except RateLimitExceeded as e:
            retry_after = int(request.state.rate_limit.reset - time.time())
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Rate limit exceeded. Try again in {retry_after} seconds",
                    "retry_after": retry_after,
                    "rate_limit": rate_limit,
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": rate_limit,
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(request.state.rate_limit.reset))
                }
            )

def setup_rate_limiter(app):
    """Set up rate limiting for the FastAPI app"""
    rate_limiter = RateLimiter()
    app.add_middleware(SlowAPIMiddleware)
    app.state.limiter = rate_limiter.limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.middleware("http")(rate_limiter)
