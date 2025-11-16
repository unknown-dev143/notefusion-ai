import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = str(Path(__file__).parent.absolute() / "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Set required environment variables
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./notefusion.db"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key"

try:
    print("Attempting to import FastAPI app...")
    from app.main import app
    print("Successfully imported FastAPI app!")
    print(f"App title: {app.title}")
    print(f"App description: {app.description[:50]}...")
except Exception as e:
    print(f"Error importing FastAPI app: {e}")
    import traceback
    traceback.print_exc()
