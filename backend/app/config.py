"""Application configuration."""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # Application settings
    ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key"  # Change this in production
    
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "NoteFusion AI"
    
    # Database settings
    DATABASE_URL: str = "sqlite+aiosqlite:///./notefusion.db"
    TEST_DATABASE_URL: str = "sqlite+aiosqlite:///./test_notefusion.db"
    
    # Authentication settings
    JWT_SECRET_KEY: str = "your-jwt-secret"  # Change this in production
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # OpenAI settings
    OPENAI_API_KEY: str = ""
    
    # Redis settings (for Celery)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # File upload settings
    UPLOAD_FOLDER: str = str(Path(__file__).parent / "uploads")
    MAX_CONTENT_LENGTH: int = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS: set = {"txt", "pdf", "png", "jpg", "jpeg", "mp3", "wav", "mp4"}
    
    # Video generation settings
    VIDEO_OUTPUT_DIR: str = str(Path(__file__).parent / "videos")
    MAX_VIDEO_DURATION: int = 600  # 10 minutes in seconds
    DEFAULT_VIDEO_WIDTH: int = 1280
    DEFAULT_VIDEO_HEIGHT: int = 720
    DEFAULT_FPS: int = 30
    
    # Temporary directory for video processing
    TEMP_DIR: str = str(Path(__file__).parent / "temp")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Create uploads directory if it doesn't exist
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
