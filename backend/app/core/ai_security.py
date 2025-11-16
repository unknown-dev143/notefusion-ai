"""AI security middleware setup and configuration."""
from fastapi import FastAPI
from typing import Optional

from app.middleware.ai_security import AISecurityMiddleware
from app.middleware.ai_rate_limiter import AIRateLimiter
from app.middleware.content_moderation import ContentModeration
from app.config.ai_config import get_ai_config

def setup_ai_security(app: FastAPI) -> None:
    """Set up AI security middleware.
    
    Args:
        app: FastAPI application instance
    """
    config = get_ai_config()
    
    # Only enable AI security if configured
    if not config.ENABLE_AI_SECURITY:
        return
    
    # Add AI security middleware
    app.add_middleware(AISecurityMiddleware)
    
    # Add content moderation if enabled
    if config.ENABLE_CONTENT_MODERATION:
        content_moderator = ContentModeration()
        app.add_middleware(content_moderator.middleware)
    
    # Add rate limiting if enabled
    if config.ENABLE_RATE_LIMITING:
        rate_limiter = AIRateLimiter(
            default_limit=config.AI_RATE_LIMIT,
            tiered_limits={
                "free": config.AI_RATE_LIMIT_FREE,
                "basic": config.AI_RATE_LIMIT_BASIC,
                "pro": config.AI_RATE_LIMIT_PRO,
            }
        )
        app.add_middleware(rate_limiter.middleware)
    
    # Add security headers if not already added
    if not any(isinstance(middleware, AISecurityMiddleware) for middleware in app.user_middleware):
        app.add_middleware(AISecurityMiddleware)
