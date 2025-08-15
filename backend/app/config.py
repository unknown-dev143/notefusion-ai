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
    
    # Stripe settings
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    
    # Cloud Storage Settings (AWS S3)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "notefusion-ai"
    S3_ENDPOINT_URL: Optional[str] = None  # For S3-compatible storage
    S3_USE_SSL: bool = True
    S3_SIGNATURE_VERSION: str = "s3v4"
    
    # Stripe price IDs (replace with your actual price IDs from Stripe Dashboard)
    STRIPE_PRICE_FREE: str = "price_xxxxxxxxxxxxxxxxxxxxxxxx"
    STRIPE_PRICE_PRO_MONTHLY: str = "price_xxxxxxxxxxxxxxxxxxxxxxxx"
    STRIPE_PRICE_PRO_YEARLY: str = "price_xxxxxxxxxxxxxxxxxxxxxxxx"
    STRIPE_PRICE_BUSINESS_MONTHLY: str = "price_xxxxxxxxxxxxxxxxxxxxxxxx"
    STRIPE_PRICE_BUSINESS_YEARLY: str = "price_xxxxxxxxxxxxxxxxxxxxxxxx"
    
    # Frontend URLs
    FRONTEND_URL: str = "http://localhost:3000"
    SUCCESS_URL: str = "{FRONTEND_URL}/billing/success"
    CANCEL_URL: str = "{FRONTEND_URL}/billing/cancel"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Create uploads directory if it doesn't exist
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
