"""
Python Environment Check Script
This script verifies the Python environment and installs required dependencies.
"""
import sys
import subprocess
import os

def check_python_version():
    """Check Python version and display information."""
    print("=== Python Environment Check ===\n")
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")

def install_dependencies():
    """Install required Python packages."""
    print("\n=== Installing Dependencies ===")
    requirements = [
        "fastapi",
        "uvicorn[standard]",
        "sqlalchemy",
        "pydantic",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "python-multipart",
        "email-validator"
    ]
    
    for package in requirements:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])

def main():
    """Main function to run environment checks and setup."""
    try:
        check_python_version()
        install_dependencies()
        print("\n✅ Environment setup completed successfully!")
        print("You can now run the application using: python minimal_app.py")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
