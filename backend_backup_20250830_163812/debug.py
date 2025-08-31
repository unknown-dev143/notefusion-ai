"""Debug script for NoteFusion AI backend."""
import os
import sys
import subprocess
import platform
from pathlib import Path

def print_header(title):
    print("\n" + "="*50)
    print(f" {title}")
    print("="*50)

def check_python():
    print_header("PYTHON ENVIRONMENT")
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {platform.python_version()}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Check if we're in a virtual environment
    print(f"\nVirtual Environment:")
    print(f"  In VENV: {hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)}")
    print(f"  sys.prefix: {sys.prefix}")
    
    # Check PATH
    print("\nPATH Environment Variable:")
    for path in os.environ.get('PATH', '').split(os.pathsep):
        if 'python' in path.lower():
            print(f"  {path}")

def check_imports():
    print_header("IMPORT CHECKS")
    imports = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'pydantic',
        'python-jose',
        'passlib',
        'python-multipart',
        'python-dotenv',
        'email-validator',
        'aiosqlite',
        'python-json-logger',
        'slowapi'
    ]
    
    for module in imports:
        try:
            __import__(module)
            print(f"✓ {module}")
        except ImportError as e:
            print(f"✗ {module}: {str(e)}")

def check_environment():
    print_header("ENVIRONMENT VARIABLES")
    required_vars = [
        'DATABASE_URL',
        'SECRET_KEY',
        'JWT_SECRET_KEY',
        'SECURITY_PASSWORD_SALT',
        'JWT_ALGORITHM',
        'CORS_ORIGINS'
    ]
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✓ {var} = {'*' * 8 if 'SECRET' in var or 'KEY' in var or 'PASSWORD' in var else value}")
        else:
            print(f"✗ {var} is not set")

def check_app_import():
    print_header("APP IMPORT TEST")
    try:
        from app.main import app
        print("✓ Successfully imported FastAPI app")
        return True
    except Exception as e:
        print(f"Error importing app: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    check_python()
    check_imports()
    check_environment()
    
    if check_app_import():
        print("\n✅ Backend appears to be properly set up!")
        print("\nTo run the development server, use:")
        print("  uvicorn app.main:app --reload")
    else:
        print("\n❌ There were issues with the setup. Please check the errors above.")

if __name__ == "__main__":
    main()
