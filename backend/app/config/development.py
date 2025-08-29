"""Development settings for NoteFusion AI."""
from .base import Settings
from typing import List
class DevelopmentSettings(Settings):
    """Development-specific settings."""
    
    # Debug mode
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./test_notefusion.db"
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["*"]
    
    # Security (weaker settings for development)
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_SECRET_KEY: str = "dev-jwt-secret-key-change-in-production"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # File uploads
    UPLOAD_FOLDER: str = str(Path(__file__).parent.parent.parent / "uploads")
    
    # Background tasks (disabled for development)
    USE_BACKGROUND_TASKS: bool = False

# Create an instance of the development settings
settings = DevelopmentSettings()
