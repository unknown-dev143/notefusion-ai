from pydantic_settings import BaseSettings
from pydantic import field_validator, EmailStr, AnyHttpUrl
from typing import List, Optional, Union, Dict, Any
import os
from dotenv import load_dotenv
from datetime import timedelta

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "NoteFusion"
    APP_ENV: str = "development"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    BACKEND_CORS_ORIGINS: Union[List[AnyHttpUrl], str] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str = "sqlite:///./notefusion.db"

    # First Superuser
    FIRST_SUPERUSER: EmailStr = "admin@notefusion.app"
    FIRST_SUPERUSER_PASSWORD: str = "changethis"

    # Email (optional)
    SMTP_TLS: bool = False
    SMTP_PORT: int = 587
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[EmailStr] = "noreply@notefusion.app"
    EMAILS_FROM_NAME: Optional[str] = "NoteFusion"

    # OpenAI (optional)
    OPENAI_API_KEY: Optional[str] = None
    AI_PROVIDER: Optional[str] = None
    AI_MODEL: Optional[str] = None
    AI_TEMPERATURE: Optional[float] = None
    MAX_TOKENS: Optional[int] = None

    # Stripe (optional)
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # Security Headers
    SECURITY_HEADERS: Dict[str, str] = {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "same-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    }

    # Rate Limiting
    RATE_LIMIT: str = "100/minute"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "allow"  # Allow extra fields

# Create settings instance
settings = Settings()
