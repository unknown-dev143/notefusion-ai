from .settings import Settings
import os

class ProductionSettings(Settings):
    """Production specific settings with Railway environment variables"""
    
    # Override database URL with Railway's PostgreSQL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", ""
    ).replace("postgres://", "postgresql+asyncpg://")
    
    # Security settings for production
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # CORS settings - update with your production frontend URL
    BACKEND_CORS_ORIGINS: list = [
        "https://notefusion-ai.vercel.app",
        "https://notefusion-ai.vercel.app"
    ]
    
    # Redis URL from Railway environment
    REDIS_URL: str = os.getenv(
        "REDIS_URL", "redis://localhost:6379/0"
    )
    
    # File storage - use Railway's persistent storage
    UPLOAD_DIR: str = "/data/uploads"
    
    # AI settings - set these in Railway environment variables
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    class Config:
        env_file = ".env.production"

# Create production settings instance
settings = ProductionSettings()
