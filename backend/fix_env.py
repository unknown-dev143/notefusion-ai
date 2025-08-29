"""Script to fix the Python environment for NoteFusion AI."""
import sys
import os
import subprocess
import platform

def print_header(text):
    """Print a formatted header."""
    print("\n" + "=" * 50)
    print(f" {text}".upper())
    print("=" * 50)

def run_command(command):
    """Run a shell command and return its output."""
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        if e.stderr:
            print(f"Stderr: {e.stderr}")
        return None

def main():
    """Main function to fix the environment."""
    print_header("NoteFusion AI Environment Fixer")
    
    # Check Python version
    print("\n🐍 Python Version:")
    print(sys.version)
    
    # Check pip version
    print("\n📦 Checking pip installation...")
    pip_output = run_command("python -m pip --version")
    if pip_output:
        print(pip_output.strip())
    else:
        print("❌ pip is not installed or not in PATH")
        print("Please install pip and try again.")
        return
    
    # Install required packages
    print("\n⬇️  Installing required packages...")
    packages = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "python-multipart",
        "email-validator",
        "pydantic",
        "python-dotenv"
    ]
    
    for package in packages:
        print(f"\nInstalling {package}...")
        result = run_command(f"python -m pip install {package}")
        if result:
            print(f"✅ {package} installed successfully")
        else:
            print(f"❌ Failed to install {package}")
    
    print_header("Environment Setup Complete")
    print("\nNext steps:")
    print("1. Run the FastAPI server: python -m uvicorn app.main:app --reload")
    print("2. Access the API docs at: http://127.0.0.1:8000/docs")

if __name__ == "__main__":
    main()
