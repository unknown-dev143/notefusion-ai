import os
import logging
from typing import Optional, Dict, Any, List, Union
from pydantic import Field, validator, RedisDsn, PostgresDsn, AnyHttpUrl
from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path
import os

logger = logging.getLogger(__name__)

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "NoteFusion AI"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    API_V1_STR: str = "/api/v1"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    # Security settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ALGORITHM: str = "HS256"
    
    # Database settings
    DATABASE_URL: PostgresDsn
    TEST_DATABASE_URL: Optional[PostgresDsn] = None
    
    # Redis settings
    REDIS_URL: RedisDsn = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600  # 1 hour
    
    # Task queue settings
    TASK_CONCURRENCY: int = 5
    TASK_RESULT_TTL: int = 86400  # 24 hours
    
    # File upload settings
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "txt", "docx", "md", "jpg", "jpeg", "png"]
    
    # AI settings
    OPENAI_API_KEY: Optional[str] = None
    DEFAULT_AI_MODEL: str = "gpt-4"
    AI_TEMPERATURE: float = 0.7
    AI_MAX_TOKENS: int = 2000
    
    # Email settings
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: Optional[str] = None
    
    # Logging settings
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Rate limiting
    RATE_LIMIT: str = "100/minute"
    RATE_LIMIT_BY_IP: bool = True
    
    # API keys for external services
    GOOGLE_API_KEY: Optional[str] = None
    FIREBASE_CREDENTIALS: Optional[Dict[str, Any]] = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @validator("FIREBASE_CREDENTIALS", pre=True)
    def parse_firebase_credentials(cls, v):
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return None
        return v

@lru_cache()
def get_settings() -> Settings:
    """Get application settings, cached for performance"""
    return Settings()

# Initialize settings based on environment
if os.getenv('RAILWAY_ENVIRONMENT') == 'production':
    from .production_settings import settings
else:
    settings = get_settings()

def setup_logging():
    """Configure logging based on settings"""
    log_level = getattr(logging, settings.LOG_LEVEL.upper())
    logging.basicConfig(
        level=log_level,
        format=settings.LOG_FORMAT,
        handlers=[
            logging.StreamHandler(),
            # Add file handler if needed
            # logging.FileHandler("app.log")
        ]
    )
    
    # Set log levels for specific loggers
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    
    logger.info(f"Logging configured with level: {settings.LOG_LEVEL}")

def ensure_directories():
    """Ensure required directories exist"""
    # Create uploads directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Create logs directory if needed
    log_dir = BASE_DIR / "logs"
    log_dir.mkdir(exist_ok=True)

# Run setup when module is imported
setup_logging()
ensure_directories()
