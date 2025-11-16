from typing import List, Dict, Any
from pydantic import BaseModel

class TestSettings:
    # Application
    APP_NAME: str = "NoteFusion Test"
    APP_ENV: str = "test"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "test_secret_key_1234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Database
    DATABASE_URL: str = "sqlite:///./test_auth.db"
    
    # JWT
    JWT_SECRET_KEY: str = "test_jwt_secret_key_1234567890"
    JWT_ALGORITHM: str = "HS256"
    
    # Authentication
    AUTH_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API
    API_V1_STR: str = "/api/v1"

# Create a settings instance for testing
test_settings = TestSettings()

# Override the settings in the config module
import sys
import config
config.settings = test_settings

# Also update the database URL in the database module
from database import engine as db_engine
from sqlalchemy import create_engine
db_engine = create_engine(test_settings.DATABASE_URL, connect_args={"check_same_thread": False})
