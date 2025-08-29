"""
Middleware for API key authentication and rate limiting.
"""
import time
from typing import Callable, Optional, Dict, Any
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.api_keys import check_api_key, get_api_key_owner
from app.db.session import get_db
from app.models.api_key import APIKeyInDB
from app.core.redis import get_redis

class APIKeyAuthMiddleware(BaseHTTPMiddleware):
    """Middleware for API key authentication and rate limiting."""
    
    async def dispatch(
        self, 
        request: Request, 
        call_next: RequestResponseEndpoint
    ) -> Response:
        # Skip API key check for public endpoints
        if self._is_public_endpoint(request):
            return await call_next(request)
        
        # Get the API key from the request headers
        api_key = request.headers.get("X-API-Key")
        if not api_key:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "API key is required"}
            )
        
        # Get database session
        db = next(get_db())
        
        try:
            # Verify the API key
            api_key_obj = await get_api_key_owner(api_key, db)
            if not api_key_obj:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Invalid API key"}
                )
            
            # Check rate limiting
            if await self._is_rate_limited(api_key_obj, request):
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Rate limit exceeded"},
                    headers={"Retry-After": "60"}
                )
            
            # Add the API key to the request state
            request.state.api_key = api_key_obj
            
            # Proceed with the request
            response = await call_next(request)
            
            # Update rate limit counters
            await self._update_rate_limit(api_key_obj, request, response.status_code)
            
            return response
            
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": str(e)}
            )
    
    def _is_public_endpoint(self, request: Request) -> bool:
        """Check if the requested endpoint is public."""
        public_paths = [
            "/docs",
            "/redoc",
            "/openapi.json",
            "/api/v1/auth/",
            "/api/v1/health"
        ]
        
        return any(request.url.path.startswith(path) for path in public_paths)
    
    async def _is_rate_limited(
        self, 
        api_key: APIKeyInDB, 
        request: Request
    ) -> bool:
        """Check if the request should be rate limited."""
        if not api_key.rate_limit:
            return False
        
        # Get Redis client
        redis = await get_redis()
        
        # Create a rate limit key
        window = int(time.time() // 60)  # 1-minute windows
        key = f"rate_limit:{api_key.id}:{window}"
        
        # Get current count
        current = await redis.get(key)
        current = int(current) if current else 0
        
        # Check if rate limit is exceeded
        if current >= api_key.rate_limit:
            return True
        
        return False
    
    async def _update_rate_limit(
        self, 
        api_key: APIKeyInDB, 
        request: Request,
        status_code: int
    ) -> None:
        """Update rate limit counters."""
        if not api_key.rate_limit:
            return
        
        # Skip for non-API endpoints
        if not request.url.path.startswith("/api/"):
            return
        
        # Get Redis client
        redis = await get_redis()
        
        # Create a rate limit key (1-minute window)
        window = int(time.time() // 60)
        key = f"rate_limit:{api_key.id}:{window}"
        
        # Increment the counter and set expiration
        async with redis.pipeline() as pipe:
            await pipe.incr(key)
            await pipe.expire(key, 120)  # 2-minute expiration
            await pipe.execute()
        
        # Log the API usage
        await self._log_api_usage(api_key, request, status_code)
    
    async def _log_api_usage(
        self, 
        api_key: APIKeyInDB, 
        request: Request,
        status_code: int
    ) -> None:
        """Log API key usage to the database."""
        from app.crud.crud_api_key import crud_api_key
        from app.db.session import get_db
        
        db = next(get_db())
        
        await crud_api_key.record_usage(
            db=db,
            api_key_id=api_key.id,
            path=request.url.path,
            method=request.method,
            status_code=status_code,
            client_ip=request.client.host if request.client else "",
            user_agent=request.headers.get("user-agent")
        )
