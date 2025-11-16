import os
import sys
import uvicorn
from pathlib import Path

def setup_environment():
    """Set up the Python environment and paths."""
    # Get the project root directory
    project_root = Path(__file__).parent.absolute()
    backend_dir = project_root / "backend"
    
    # Add backend directory to Python path
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    
    # Set environment variables
    os.environ["PYTHONPATH"] = str(backend_dir)
    os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./notefusion.db"
    os.environ["SECRET_KEY"] = "test-secret-key-change-in-production"
    os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key-change-in-production"
    os.environ["SECURITY_PASSWORD_SALT"] = "test-salt-change-in-production"

if __name__ == "__main__":
    # Set up environment
    setup_environment()
    
    # Run the FastAPI application
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(Path(__file__).parent.absolute() / "backend" / "app")],
        log_level="debug"
    )
