""
Redis client and utilities for rate limiting and caching.
"""
import json
from typing import Any, Optional, Dict, Union, List
import aioredis
from fastapi import Depends

from app.core.config import settings

# Global Redis connection pool
_redis: Optional[aioredis.Redis] = None

async def get_redis() -> aioredis.Redis:
    """Get Redis client with connection pooling."""
    global _redis
    if _redis is None:
        _redis = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20
        )
    return _redis

async def close_redis() -> None:
    """Close Redis connection."""
    global _redis
    if _redis:
        await _redis.close()
        await _redis.connection_pool.disconnect()
        _redis = None

class RedisCache:
    """Redis cache wrapper with JSON serialization."""
    
    def __init__(self, redis: aioredis.Redis, prefix: str = "cache:"):
        self.redis = redis
        self.prefix = prefix
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a value from cache."""
        value = await self.redis.get(f"{self.prefix}{key}")
        if value is None:
            return None
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        expire: Optional[int] = None
    ) -> bool:
        """Set a value in cache."""
        if isinstance(value, (str, int, float, bool)):
            serialized = str(value)
        else:
            serialized = json.dumps(value)
        
        if expire is not None:
            return await self.redis.set(
                f"{self.prefix}{key}",
                serialized,
                ex=expire
            )
        return await self.redis.set(f"{self.prefix}{key}", serialized)
    
    async def delete(self, key: str) -> bool:
        """Delete a key from cache."""
        return await self.redis.delete(f"{self.prefix}{key}") > 0
    
    async def exists(self, key: str) -> bool:
        """Check if a key exists in cache."""
        return await self.redis.exists(f"{self.prefix}{key}") > 0
    
    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment a counter in cache."""
        return await self.redis.incr(f"{self.prefix}{key}", amount)
    
    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration time for a key."""
        return await self.redis.expire(f"{self.prefix}{key}", seconds)
    
    async def get_many(self, keys: List[str]) -> Dict[str, Any]:
        """Get multiple values from cache."""
        prefixed_keys = [f"{self.prefix}{key}" for key in keys]
        values = await self.redis.mget(prefixed_keys)
        
        result = {}
        for key, value in zip(keys, values):
            if value is not None:
                try:
                    result[key] = json.loads(value)
                except (json.JSONDecodeError, TypeError):
                    result[key] = value
        return result
    
    async def set_many(
        self, 
        items: Dict[str, Any],
        expire: Optional[int] = None
    ) -> bool:
        """Set multiple values in cache."""
        pipe = self.redis.pipeline()
        
        for key, value in items.items():
            if isinstance(value, (str, int, float, bool)):
                serialized = str(value)
            else:
                serialized = json.dumps(value)
            
            if expire is not None:
                pipe.setex(f"{self.prefix}{key}", expire, serialized)
            else:
                pipe.set(f"{self.prefix}{key}", serialized)
        
        return await pipe.execute()

# Dependency for FastAPI
def get_redis_cache() -> RedisCache:
    """Get Redis cache instance."""
    redis = get_redis()
    return RedisCache(redis)

# Rate limiting utilities
async def check_rate_limit(
    key: str,
    limit: int,
    window: int = 60,
    redis: Optional[aioredis.Redis] = None
) -> Dict[str, Any]:
    """Check if a rate limit has been exceeded."""
    if redis is None:
        redis = await get_redis()
    
    current = await redis.get(key)
    current = int(current) if current else 0
    
    if current >= limit:
        return {
            "allowed": False,
            "current": current,
            "remaining": 0,
            "reset": window - (int(time.time()) % window)
        }
    
    return {
        "allowed": True,
        "current": current,
        "remaining": limit - current - 1,
        "reset": window - (int(time.time()) % window)
    }

async def increment_rate_limit(
    key: str,
    window: int = 60,
    amount: int = 1,
    redis: Optional[aioredis.Redis] = None
) -> int:
    """Increment a rate limit counter."""
    if redis is None:
        redis = await get_redis()
    
    async with redis.pipeline() as pipe:
        try:
            pipe.incr(key, amount)
            pipe.expire(key, window)
            results = await pipe.execute()
            return results[0]
        except Exception as e:
            # Log error but don't fail the request
            import logging
            logging.error(f"Redis error in increment_rate_limit: {str(e)}")
            return 0
