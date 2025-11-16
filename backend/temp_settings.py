from pydantic import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "test-secret-key-1234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./notefusion.db"
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]

settings = Settings()
