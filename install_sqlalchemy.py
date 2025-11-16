import sys
import subprocess
import os

def main():
    # Get the Python executable path
    python_exe = sys.executable
    if not python_exe:
        python_exe = 'python'
    
    print(f"Using Python: {python_exe}")
    
    # Check if SQLAlchemy is installed
    try:
        import sqlalchemy
        print(f"SQLAlchemy is already installed (version: {sqlalchemy.__version__})")
        return
    except ImportError:
        print("SQLAlchemy is not installed. Installing now...")
    
    # Install SQLAlchemy
    try:
        subprocess.check_call([python_exe, "-m", "pip", "install", "sqlalchemy"])
        print("Successfully installed SQLAlchemy!")
    except subprocess.CalledProcessError as e:
        print(f"Error installing SQLAlchemy: {e}")
        print("\nTroubleshooting steps:")
        print("1. Make sure you have internet connection")
        print("2. Try running this script as Administrator")
        print("3. Try running: ", end='')
        print(f'"{python_exe}" -m pip install --user sqlalchemy')
        print("4. If you're using a virtual environment, make sure it's activated")

if __name__ == "__main__":
    main()
