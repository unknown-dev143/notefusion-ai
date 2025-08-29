"""Production configuration settings."""
import os
from pathlib import Path
from .base import Settings

class ProductionSettings(Settings):
    """Production configuration settings."""
    
    # Application settings
    ENV: str = "production"
    DEBUG: bool = False
    
    # Database settings - will be overridden by environment variables in docker-compose
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://notefusion:notefusion123@db:5432/notefusion"
    )
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-in-production")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-this-in-production")
    
    # CORS settings
    CORS_ORIGINS: list = [
        "http://localhost:3000",  # Frontend development
        "https://your-production-domain.com"  # Update with your production domain
    ]
    
    # File upload settings
    UPLOAD_FOLDER: str = "/app/uploads"
    MAX_CONTENT_LENGTH: int = 100 * 1024 * 1024  # 100MB max upload size
    
    # Redis settings
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    
    # Background task settings
    USE_BACKGROUND_TASKS: bool = True
    
    # Model settings
    MODEL_UPDATE_INTERVAL: int = 3600  # Check for model updates every hour
    
    class Config:
        case_sensitive = True

# Create production settings instance
settings = ProductionSettings()

# Create necessary directories
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
