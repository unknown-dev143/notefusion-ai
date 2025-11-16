"""Verify Python environment and dependencies."""
import sys
import os
import platform
import subprocess

def print_header(text):
    """Print a formatted header."""
    print("\n" + "=" * 50)
    print(f" {text}")
    print("=" * 50)

def check_python():
    """Check Python version and environment."""
    print_header("PYTHON ENVIRONMENT")
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {platform.python_version()}")
    print(f"Working Directory: {os.getcwd()}")
    print(f"\nVirtual Environment: {hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)}")
    print(f"sys.prefix: {sys.prefix}")

def check_imports():
    """Check if required packages are installed."""
    print_header("REQUIRED PACKAGES")
    packages = [
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
    
    for pkg in packages:
        try:
            __import__(pkg)
            print(f"✓ {pkg}")
        except ImportError:
            print(f"✗ {pkg} (not installed)")

def check_environment():
    """Check required environment variables."""
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

def main():
    """Main function to run all checks."""
    check_python()
    check_imports()
    check_environment()

if __name__ == "__main__":
    main()
