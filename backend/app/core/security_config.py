"""Security configuration for the application."""
from typing import Dict, List, Optional, Union, Any
from pydantic import BaseSettings, Field, validator, HttpUrl, PostgresDsn
from functools import lru_cache
import secrets
import string
from datetime import timedelta

class SecuritySettings(BaseSettings):
    """Security settings for the application."""
    
    # JWT Settings
    JWT_SECRET_KEY: str = Field(
        default_factory=lambda: ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32)),
        env="JWT_SECRET_KEY"
    )
    JWT_ALGORITHM: str = Field("HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(30, env="REFRESH_TOKEN_EXPIRE_DAYS")
    JWT_LEEWAY: int = Field(60, env="JWT_LEEWAY")  # 1 minute leeway for clock skew
    
    # Password Settings
    PASSWORD_MIN_LENGTH: int = Field(12, env="PASSWORD_MIN_LENGTH")
    PASSWORD_REQUIRE_UPPERCASE: bool = Field(True, env="PASSWORD_REQUIRE_UPPERCASE")
    PASSWORD_REQUIRE_LOWERCASE: bool = Field(True, env="PASSWORD_REQUIRE_LOWERCASE")
    PASSWORD_REQUIRE_NUMBERS: bool = Field(True, env="PASSWORD_REQUIRE_NUMBERS")
    PASSWORD_REQUIRE_SPECIAL_CHARS: bool = Field(True, env="PASSWORD_REQUIRE_SPECIAL_CHARS")
    
    # Rate Limiting
    RATE_LIMIT: str = Field("1000/day, 100/hour, 10/minute", env="RATE_LIMIT")
    RATE_LIMIT_BY_IP: bool = Field(True, env="RATE_LIMIT_BY_IP")
    RATE_LIMIT_TRUST_PROXY: bool = Field(False, env="RATE_LIMIT_TRUST_PROXY")
    
    # API Key Settings
    API_KEY_HEADER: str = Field("X-API-Key", env="API_KEY_HEADER")
    API_KEY_PREFIX: str = Field("nf_", env="API_KEY_PREFIX")
    API_KEY_LENGTH: int = Field(32, env="API_KEY_LENGTH")
    API_KEY_SECRET: str = Field(
        default_factory=lambda: ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64)),
        env="API_KEY_SECRET"
    )
    API_KEY_EXPIRE_DAYS: int = Field(365, env="API_KEY_EXPIRE_DAYS")  # 1 year default
    
    # Rate limiting for API keys (requests per minute)
    API_KEY_RATE_LIMIT_DEFAULT: int = Field(100, env="API_KEY_RATE_LIMIT_DEFAULT")
    API_KEY_RATE_LIMIT_WINDOW: int = Field(60, env="API_KEY_RATE_LIMIT_WINDOW")  # seconds
    
    # CORS
    CORS_ORIGINS: List[Union[HttpUrl, str]] = Field(
        [
            "http://localhost:3000",
            "http://localhost:8000",
            "https://notefusion-ai.vercel.app"
        ],
        env="CORS_ORIGINS"
    )
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Security Headers
    SECURE_HSTS_SECONDS: int = Field(31536000, env="SECURE_HSTS_SECONDS")  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS: bool = Field(True, env="SECURE_HSTS_INCLUDE_SUBDOMAINS")
    SECURE_HSTS_PRELOAD: bool = Field(True, env="SECURE_HSTS_PRELOAD")
    SECURE_CONTENT_TYPE_NOSNIFF: bool = Field(True, env="SECURE_CONTENT_TYPE_NOSNIFF")
    SECURE_BROWSER_XSS_FILTER: bool = Field(True, env="SECURE_BROWSER_XSS_FILTER")
    SESSION_COOKIE_SECURE: bool = Field(True, env="SESSION_COOKIE_SECURE")
    SESSION_COOKIE_HTTPONLY: bool = Field(True, env="SESSION_COOKIE_HTTPONLY")
    SESSION_COOKIE_SAMESITE: str = Field("lax", env="SESSION_COOKIE_SAMESITE")
    
    # Security Middleware
    SECURE_REFERRER_POLICY: str = Field("strict-origin-when-cross-origin", env="SECURE_REFERRER_POLICY")
    SECURE_CROSS_ORIGIN_OPENER_POLICY: str = Field("same-origin", env="SECURE_CROSS_ORIGIN_OPENER_POLICY")
    SECURE_PERMISSIONS_POLICY: Dict[str, List[str]] = Field(
        default_factory=lambda: {
            "accelerometer": [],
            "camera": [],
            "geolocation": [],
            "gyroscope": [],
            "magnetometer": [],
            "microphone": [],
            "payment": [],
            "usb": []
        },
        env="SECURE_PERMISSIONS_POLICY"
    )
    
    # CSRF Protection
    CSRF_COOKIE_SECURE: bool = Field(True, env="CSRF_COOKIE_SECURE")
    CSRF_COOKIE_HTTPONLY: bool = Field(False, env="CSRF_COOKIE_HTTPONLY")
    CSRF_COOKIE_SAMESITE: str = Field("lax", env="CSRF_COOKIE_SAMESITE")
    CSRF_HEADER_NAME: str = Field("X-CSRF-Token", env="CSRF_HEADER_NAME")
    CSRF_COOKIE_NAME: str = Field("csrftoken", env="CSRF_COOKIE_NAME")
    
    # Content Security Policy
    CSP_REPORT_URI: Optional[HttpUrl] = Field(None, env="CSP_REPORT_URI")
    CSP_REPORT_ONLY: bool = Field(False, env="CSP_REPORT_ONLY")
    CSP_DIRECTIVES: Dict[str, List[str]] = Field(
        default_factory=lambda: {
            "default-src": ["'self'"],
            "script-src": ["'self'"],
            "style-src": ["'self'"],
            "img-src": ["'self'"],
            "font-src": ["'self'"],
            "connect-src": ["'self'"],
            "frame-src": ["'none'"],
            "object-src": ["'none'"],
            "base-uri": ["'self'"],
            "form-action": ["'self'"],
            "frame-ancestors": ["'none'"],
            "block-all-mixed-content": [],
            "upgrade-insecure-requests": []
        },
        env="CSP_DIRECTIVES"
    )
    
    # Security Headers Configuration
    SECURE_HEADERS: Dict[str, Any] = Field(
        default_factory=lambda: {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "",  # Will be generated from SECURE_PERMISSIONS_POLICY
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Resource-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Content-Security-Policy": "",  # Will be generated from CSP_DIRECTIVES
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
        },
        env="SECURE_HEADERS"
    )
    
    # Security Headers
    X_FRAME_OPTIONS: str = Field("DENY", env="X_FRAME_OPTIONS")
    X_CONTENT_TYPE_OPTIONS: str = Field("nosniff", env="X_CONTENT_TYPE_OPTIONS")
    X_XSS_PROTECTION: str = Field("1; mode=block", env="X_XSS_PROTECTION")
    
    # Security Features
    SECURE_REFERRER_POLICY: str = Field("strict-origin-when-cross-origin", env="SECURE_REFERRER_POLICY")
    PERMISSIONS_POLICY: str = Field(
        "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
        env="PERMISSIONS_POLICY"
    )
    
    # Rate limiting for specific endpoints
    AUTH_RATE_LIMIT: str = Field("5/minute", env="AUTH_RATE_LIMIT")
    API_RATE_LIMIT: str = Field("1000/day, 100/hour", env="API_RATE_LIMIT")
    
    # Security logging
    SECURITY_LOGGING_ENABLED: bool = Field(True, env="SECURITY_LOGGING_ENABLED")
    LOG_SENSITIVE_DATA: bool = Field(False, env="LOG_SENSITIVE_DATA")
    
    class Config:
        """Pydantic config."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_security_settings() -> SecuritySettings:
    """Get security settings."""
    return SecuritySettings()
