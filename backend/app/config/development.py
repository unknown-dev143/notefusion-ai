"""Development settings for NoteFusion AI."""
from pathlib import Path
from .base import Settings
from typing import List, Optional, Dict, Any

class DevelopmentSettings(Settings):
    """Development-specific settings."""
    
    # Application settings
    ENV: str = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "NoteFusion AI (Dev)"
    VERSION: str = "1.0.0"
    
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # Security settings
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_SECRET_KEY: str = "dev-jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # Database settings
    DATABASE_URL: str = "sqlite+aiosqlite:///./test_notefusion.db"
    TEST_DATABASE_URL: str = "sqlite+aiosqlite:///./test_notefusion_test.db"
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["*"]
    
    # File uploads
    UPLOAD_FOLDER: str = str(Path(__file__).parent.parent.parent / "uploads")
    
    # Background tasks (disabled for development)
    USE_BACKGROUND_TASKS: bool = False
    
    # Email settings
    EMAILS_ENABLED: bool = False
    SMTP_TLS: bool = False
    SMTP_PORT: int = 1025  # MailHog default port
    SMTP_HOST: str = "localhost"
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    # Application URLs
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Model configuration
    class Config:
        extra = "ignore"  # Ignore extra fields in the environment

# Create an instance of the development settings
settings = DevelopmentSettings()
