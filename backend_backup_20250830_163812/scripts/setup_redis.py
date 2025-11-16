"""
Script to set up Redis for rate limiting.
This script ensures Redis is properly configured with the required keys and settings.
"""
import asyncio
import os
from typing import Dict, Any

import aioredis
from app.core.config import settings
from app.core.logging_config import logger

async def setup_redis():
    """Set up Redis with initial configuration."""
    try:
        # Initialize Redis connection
        redis = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        
        # Test the connection
        await redis.ping()
        logger.info("Successfully connected to Redis")
        
        # Set up initial rate limiting configuration
        config = {
            "rate_limit:default:limit": settings.API_KEY_RATE_LIMIT_DEFAULT,
            "rate_limit:default:window": "60",  # 1 minute window
        }
        
        # Set the configuration values
        for key, value in config.items():
            await redis.set(key, value, nx=True)  # Only set if not exists
        
        logger.info("Redis configuration completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error setting up Redis: {str(e)}")
        return False
    finally:
        if 'redis' in locals():
            await redis.close()
            await redis.connection_pool.disconnect()

if __name__ == "__main__":
    # Run the setup
    asyncio.run(setup_redis())
