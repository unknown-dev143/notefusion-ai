"""Application configuration with enhanced security settings."""
import os
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, validator, SecretStr
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # Application settings
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Security settings
    SECRET_KEY: SecretStr = os.getenv("SECRET_KEY", "your-secret-key")
    SECURITY_PASSWORD_SALT: str = os.getenv("SECURITY_PASSWORD_SALT", "your-password-salt")
    
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "NoteFusion AI"
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./notefusion.db")
    TEST_DATABASE_URL: str = os.getenv("TEST_DATABASE_URL", "sqlite+aiosqlite:///./test_notefusion.db")
    
    # Database connection pool settings
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "3600"))
    DB_ECHO: bool = os.getenv("DB_ECHO", "false").lower() == "true"
    
    # JWT settings
    JWT_SECRET_KEY: SecretStr = os.getenv("JWT_SECRET_KEY", "your-jwt-secret-key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "30"))  # 30 days
    JWT_VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24  # 24 hours
    JWT_PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour
    
    # Rate limiting
    RATE_LIMIT: str = os.getenv("RATE_LIMIT", "100/minute")
    
    # Email settings
    EMAILS_ENABLED: bool = os.getenv("EMAILS_ENABLED", "false").lower() == "true"
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() == "true"
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "1025"))  # Default to MailHog port
    SMTP_HOST: str = os.getenv("SMTP_HOST", "mailhog")  # Default to mailhog service name
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "noreply@notefusion.ai")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "NoteFusion AI")
    
    # Security headers
    SECURE_HSTS_SECONDS: int = 31536000  # 1 year
    SECURE_CONTENT_TYPE_NOSNIFF: bool = True
    SECURE_BROWSER_XSS_FILTER: bool = True
    SESSION_COOKIE_HTTPONLY: bool = True
    SESSION_COOKIE_SECURE: bool = not DEBUG
    CSRF_COOKIE_SECURE: bool = not DEBUG
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        return ["*"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    # Redis settings (for caching and Celery)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    REDIS_CACHE_TTL: int = 300  # 5 minutes default cache TTL
    
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

# Create necessary directories if they don't exist
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(settings.VIDEO_OUTPUT_DIR, exist_ok=True)
os.makedirs(settings.TEMP_DIR, exist_ok=True)
