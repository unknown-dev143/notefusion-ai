import json
import hashlib
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, TypeVar, Type, Callable
import logging
from functools import wraps
import redis
from pydantic import BaseModel

logger = logging.getLogger(__name__)
T = TypeVar('T', bound=BaseModel)

class CacheConfig:
    """Configuration for caching behavior"""
    def __init__(
        self,
        ttl: int = 3600,  # 1 hour default
        max_size: int = 1000,
        enabled: bool = True,
        redis_url: Optional[str] = None
    ):
        self.ttl = ttl
        self.max_size = max_size
        self.enabled = enabled
        self.redis_url = redis_url
        self.redis_client = None
        if redis_url:
            try:
                self.redis_client = redis.Redis.from_url(redis_url)
                self.redis_client.ping()  # Test connection
                logger.info("Connected to Redis cache")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis: {e}. Falling back to in-memory cache.")
                self.redis_client = None

class CacheManager:
    """Manages caching of API responses and other data"""
    _instance = None
    
    def __new__(cls, config: Optional[CacheConfig] = None):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.config = config or CacheConfig()
            cls._instance.memory_cache = {}
            cls._instance.cache_keys = []  # For LRU eviction
        return cls._instance
    
    def _get_cache_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a unique cache key from function arguments"""
        key_parts = [prefix] + [str(arg) for arg in args] + [f"{k}={v}" for k, v in sorted(kwargs.items())]
        key_str = ":".join(key_parts)
        return hashlib.md5(key_str.encode('utf-8')).hexdigest()
    
    async def get(self, key: str, model: Type[T] = None) -> Optional[T]:
        """Get a value from cache"""
        if not self.config.enabled:
            return None
            
        try:
            # Try Redis first
            if self.config.redis_client:
                cached = self.config.redis_client.get(key)
                if cached:
                    data = json.loads(cached)
                    if model and issubclass(model, BaseModel):
                        return model(**data)
                    return data
            
            # Fall back to in-memory cache
            if key in self.memory_cache:
                entry = self.memory_cache[key]
                if datetime.now().timestamp() < entry['expires']:
                    # Update key position for LRU
                    if key in self.cache_keys:
                        self.cache_keys.remove(key)
                    self.cache_keys.append(key)
                    return entry['data']
                self._delete(key)
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            
        return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set a value in cache"""
        if not self.config.enabled:
            return
            
        ttl = ttl or self.config.ttl
        expires = (datetime.now() + timedelta(seconds=ttl)).timestamp()
        
        try:
            # Store in Redis if available
            if self.config.redis_client:
                serialized = json.dumps(value.dict() if hasattr(value, 'dict') else value)
                self.config.redis_client.setex(key, ttl, serialized)
                return
            
            # Fall back to in-memory cache
            # Evict if we're at capacity
            if len(self.memory_cache) >= self.config.max_size and self.cache_keys:
                oldest_key = self.cache_keys.pop(0)
                self._delete(oldest_key)
            
            # Store the value
            self.memory_cache[key] = {
                'data': value,
                'expires': expires
            }
            self.cache_keys.append(key)
            
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    def _delete(self, key: str):
        """Delete a key from all caches"""
        if key in self.memory_cache:
            del self.memory_cache[key]
        if key in self.cache_keys:
            self.cache_keys.remove(key)
        if self.config.redis_client:
            self.config.redis_client.delete(key)
    
    def clear(self, prefix: Optional[str] = None):
        """Clear all or filtered cache entries"""
        try:
            if self.config.redis_client:
                if prefix:
                    # Delete all keys matching the prefix
                    keys = self.config.redis_client.keys(f"{prefix}:*")
                    if keys:
                        self.config.redis_client.delete(*keys)
                else:
                    self.config.redis_client.flushdb()
            
            if prefix:
                # Clear in-memory cache with prefix
                keys_to_delete = [k for k in self.memory_cache if k.startswith(prefix)]
                for key in keys_to_delete:
                    self._delete(key)
            else:
                self.memory_cache.clear()
                self.cache_keys = []
                
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
    
    def cached(
        self,
        ttl: int = 3600,
        key_prefix: Optional[str] = None,
        exclude_args: Optional[list] = None,
        model: Optional[Type[T]] = None
    ) -> Callable:
        """Decorator to cache function results"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Skip caching if disabled
                if not self.config.enabled:
                    return await func(*args, **kwargs)
                
                # Generate cache key
                prefix = key_prefix or f"{func.__module__}:{func.__name__}"
                
                # Exclude certain arguments from cache key
                cache_kwargs = kwargs.copy()
                if exclude_args:
                    for arg in exclude_args:
                        cache_kwargs.pop(arg, None)
                
                cache_key = self._get_cache_key(prefix, *args, **cache_kwargs)
                
                # Try to get from cache
                cached = await self.get(cache_key, model=model)
                if cached is not None:
                    logger.debug(f"Cache hit for {cache_key}")
                    return cached
                
                # Call the function and cache the result
                result = await func(*args, **kwargs)
                if result is not None:
                    await self.set(cache_key, result, ttl=ttl)
                
                return result
            return wrapper
        return decorator

# Default cache instance
cache_manager = CacheManager()

def setup_caching(app, config: Optional[CacheConfig] = None):
    """Set up caching for the application"""
    cache_manager.config = config or CacheConfig()
    
    @app.on_event("shutdown")
    async def shutdown_event():
        if cache_manager.config.redis_client:
            await cache_manager.config.redis_client.close()
    
    return cache_manager
