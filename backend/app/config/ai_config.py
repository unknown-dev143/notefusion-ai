"""AI-specific configuration and settings."""
from functools import lru_cache
from pydantic import BaseSettings, Field

class AIConfig(BaseSettings):
    """Configuration for AI features and security."""
    
    # Rate limiting settings for AI endpoints
    AI_RATE_LIMIT: str = "60/minute"
    AI_RATE_LIMIT_FREE: str = "30/minute"
    AI_RATE_LIMIT_BASIC: str = "100/minute"
    AI_RATE_LIMIT_PRO: str = "1000/minute"
    
    # Content moderation settings
    ENABLE_CONTENT_MODERATION: bool = True
    MODERATION_STRICTNESS: str = "medium"  # low, medium, high
    
    # Input validation settings
    MAX_INPUT_LENGTH: int = 10000
    MAX_TOKENS: int = 4000
    
    # Security settings
    ENABLE_AI_SECURITY: bool = True
    ENABLE_RATE_LIMITING: bool = True
    
    class Config:
        env_prefix = "AI_"
        env_file = ".env"

@lru_cache()
def get_ai_config() -> AIConfig:
    """Get AI configuration with caching."""
    return AIConfig()
