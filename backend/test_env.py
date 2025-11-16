import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up test environment variables
os.environ["SECRET_KEY"] = "test-secret-key-1234567890"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"
os.environ["DATABASE_URL"] = "sqlite:///./notefusion.db"
os.environ["BACKEND_CORS_ORIGINS"] = "[]"

print("Test environment variables set successfully.")
