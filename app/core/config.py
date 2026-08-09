import os

from functools import lru_cache
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, EmailStr, HttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application settings
    PROJECT_NAME: str = "NoteFusion AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Security
    SECURITY_BCRYPT_ROUNDS: int = 12
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 60 * 60 * 24 * 1  # 1 day
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_AUDIENCE: str = "note_fusion:auth"
    JWT_ISSUER: str = "note_fusion"
    JWT_ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        # Free hosting URLs — updated after first deploy
        "https://notefusion-ai.vercel.app",
        "https://notefusion-frontend.vercel.app",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "notefusion")
    DATABASE_URI: Optional[Union[PostgresDsn, str]] = None

    @field_validator("DATABASE_URI", mode="before")
    def assemble_db_connection(cls, v: Optional[str], info: Any) -> Any:
        if isinstance(v, str):
            return v
        values = info.data
        return f"postgresql+asyncpg://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}/{values.get('POSTGRES_DB') or ''}"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./notefusion.db")
    DATABASE_POOL_SIZE: int = int(os.getenv("DATABASE_POOL_SIZE", "5"))
    DATABASE_POOL_MAX_OVERFLOW: int = int(os.getenv("DATABASE_POOL_MAX_OVERFLOW", "10"))
    DATABASE_POOL_PRE_PING: bool = (
        os.getenv("DATABASE_POOL_PRE_PING", "True").lower() == "true"
    )
    DATABASE_POOL_RECYCLE: int = int(os.getenv("DATABASE_POOL_RECYCLE", "3600"))
    DATABASE_POOL_TIMEOUT: int = int(os.getenv("DATABASE_POOL_TIMEOUT", "30"))

    # First superuser
    FIRST_SUPERUSER_EMAIL: EmailStr = os.getenv(
        "FIRST_SUPERUSER_EMAIL", "admin@example.com"
    )
    FIRST_SUPERUSER_PASSWORD: str = os.getenv("FIRST_SUPERUSER_PASSWORD", "changethis")

    # Security
    SECURE_COOKIES: bool = os.getenv("SECURE_COOKIES", "False").lower() in (
        "true",
        "1",
        "t",
    )
    SESSION_COOKIE_NAME: str = "note_fusion_session"
    SESSION_SECRET_KEY: str = os.getenv("SESSION_SECRET_KEY", "your-session-secret-key")

    # Rate limiting
    RATE_LIMIT: int = 100  # requests per minute
    RATE_LIMIT_WINDOW: int = 60  # seconds

    # Login security
    MAX_LOGIN_ATTEMPTS: int = 5
    LOGIN_LOCKOUT_MINUTES: int = 15

    # Email settings
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[EmailStr] = None
    EMAILS_FROM_NAME: Optional[str] = None

    @field_validator("EMAILS_FROM_NAME")
    def get_project_name(cls, v: Optional[str], info: Any) -> str:
        if not v:
            return info.data["PROJECT_NAME"]
        return v

    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48
    EMAIL_TEMPLATES_DIR: str = "/app/app/email-templates/build"
    EMAILS_ENABLED: bool = False

    @field_validator("EMAILS_ENABLED", mode="before")
    def get_emails_enabled(cls, v: bool, info: Any) -> bool:
        values = info.data
        return bool(
            values.get("SMTP_HOST")
            and values.get("SMTP_PORT")
            and values.get("EMAILS_FROM_EMAIL")
        )

    # Storage
    MEDIA_ROOT: str = "/app/media"
    MAX_UPLOAD_SIZE: int = 1024 * 1024 * 50  # 50MB
    ALLOWED_FILE_TYPES: List[str] = ["image/jpeg", "image/png", "application/pdf"]

    # OpenAI
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")

    # HuggingFace (free-tier fallback LLM)
    HF_API_KEY: Optional[str] = os.getenv("HF_API_KEY")

    # Stripe payments
    # Test keys start with sk_test_ / pk_test_  (no real money)
    # Live keys start with sk_live_ / pk_live_  (real money – use only in production!)
    STRIPE_SECRET_KEY: Optional[str] = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY: Optional[str] = os.getenv("STRIPE_PUBLISHABLE_KEY")

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str = os.getenv(
        "GOOGLE_REDIRECT_URI",
        "https://notefusion-backend.onrender.com/api/v1/auth/google/callback",
    )

    # Domain (free hosting placeholder until you buy a real domain)
    FREE_DOMAIN: str = os.getenv("FREE_DOMAIN", "localhost:3000")
    FRONTEND_RESET_URL: str = os.getenv("FRONTEND_RESET_URL", "")
    FRONTEND_VERIFY_URL: str = os.getenv("FRONTEND_VERIFY_URL", "")

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    TESTING: bool = os.getenv("TESTING", "False").lower() in ("true", "1", "t")
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN")

    model_config = SettingsConfigDict(
        case_sensitive=True, env_file=".env", extra="allow"
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Get the application settings, cached for performance.
    """
    return Settings()


# Create settings instance
settings = get_settings()
