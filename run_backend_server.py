import os
import sys
import uvicorn
from pathlib import Path

def main():
    # Add the backend directory to Python path
    backend_dir = str(Path(__file__).parent.absolute() / "backend")
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    
    # Set required environment variables
    os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./notefusion.db"
    os.environ["SECRET_KEY"] = "test-secret-key"
    os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key"
    
    # Import the app after setting up the environment
    from app.main import app
    
    # Run the app
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )

if __name__ == "__main__":
    main()
