import os
import sys
from pathlib import Path

def setup_environment():
    """Set up the development environment"""
    # Define paths
    backend_dir = Path(__file__).parent / "backend"
    env_path = backend_dir / ".env"
    
    # Create .env file if it doesn't exist
    if not env_path.exists():
        with open(env_path, "w") as f:
            f.write("""# Development Environment
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production

# Database
DATABASE_URL=sqlite+aiosqlite:///./notefusion.db

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS=30
ALGORITHM=HS256

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
""")
        print(f"✅ Created {env_path}")
    else:
        print(f"ℹ️  {env_path} already exists")
    
    # Create uploads directory
    uploads_dir = backend_dir / "uploads"
    uploads_dir.mkdir(exist_ok=True)
    print(f"✅ Created {uploads_dir}")
    
    # Create database if it doesn't exist
    db_path = backend_dir / "notefusion.db"
    if not db_path.exists():
        db_path.touch()
        print(f"✅ Created database at {db_path}")
    else:
        print(f"ℹ️  Database already exists at {db_path}")
    
    print("\n🎉 Development environment setup complete!")
    print("\nNext steps:")
    print("1. Start the backend server:")
    print("   cd backend")
    print("   uvicorn app.main:app --reload --port 8000")
    print("\n2. In a new terminal, generate an API key:")
    print("   python generate_api_key.py")
    print("\n3. Test the API:")
    print("   python test_api_key.py")

if __name__ == "__main__":
    print("🚀 Setting up development environment...\n")
    setup_environment()
