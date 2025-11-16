import subprocess
import sys

def install_packages():
    print("Installing required packages...")
    packages = ["aiofiles", "fastapi", "uvicorn", "sqlalchemy", "python-jose[cryptography]", "passlib[bcrypt]", "python-multipart", "python-dotenv"]
    
    for package in packages:
        print(f"Installing {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"Successfully installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to install {package}. Error: {e}")
    
    print("\nInstallation complete. Starting server...")
    subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--reload"])

if __name__ == "__main__":
    install_packages()
