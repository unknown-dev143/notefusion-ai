"""Base configuration settings."""
from typing import List, Optional, Dict, Any
import os
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Base settings for the application."""
    
    # Application settings
    ENV: str = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "NoteFusion AI"
    VERSION: str = "1.0.0"
    
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # Security settings
    SECRET_KEY: str = "change-this-in-production"
    JWT_SECRET_KEY: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Database settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/notefusion"
    TEST_DATABASE_URL: str = "sqlite+aiosqlite:///./test_notefusion.db"
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]
    
    # File upload settings
    UPLOAD_FOLDER: str = str(Path(__file__).parent.parent.parent / "uploads")
    MAX_CONTENT_LENGTH: int = 100 * 1024 * 1024  # 100MB max upload size
    ALLOWED_EXTENSIONS: set = {"wav", "mp3", "m4a", "ogg", "flac", "pdf", "txt"}
    
    # Redis settings
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Background task settings
    USE_BACKGROUND_TASKS: bool = True
    
    # Audio processing settings
    AUDIO_SAMPLE_RATE: int = 16000
    AUDIO_CHUNK_SIZE: int = 1024
    
    # Model settings
    MODEL_UPDATE_INTERVAL: int = 3600  # Check for model updates every hour
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"
