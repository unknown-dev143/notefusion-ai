import sys
import subprocess
import os

def install_packages():
    print("=== Installing Required Packages ===\n")
    
    packages = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "python-multipart",
        "python-dotenv",
        "alembic"
    ]
    
    for package in packages:
        print(f"Installing {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ {package} installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {str(e)}")
    
    print("\n=== Installation Complete ===")
    print("\nTo start the backend server, run:")
    print("  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print("\nTo start the frontend development server, run:")
    print("  cd frontend")
    print("  npm install --legacy-peer-deps")
    print("  npm run dev")

if __name__ == "__main__":
    install_packages()
