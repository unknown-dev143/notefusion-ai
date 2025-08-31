"""Test FastAPI import and basic functionality."""
import sys
import os

def main():
    # Add current directory to path
    sys.path.insert(0, os.path.abspath('.'))
    
    print("Python version:", sys.version)
    print("\nPython path:")
    for p in sys.path:
        print(f" - {p}")
    
    print("\nTesting FastAPI import...")
    try:
        from fastapi import FastAPI
        print("✅ FastAPI imported successfully!")
        
        # Create a minimal app
        app = FastAPI()
        print(f"✅ Created FastAPI app with title: {app.title}")
        
    except ImportError as e:
        print(f"❌ Error importing FastAPI: {e}")
        print("\nTrying to install FastAPI...")
        try:
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn"])
            print("✅ Successfully installed FastAPI and uvicorn")
            print("Please run this script again to verify the installation.")
        except Exception as install_error:
            print(f"❌ Failed to install FastAPI: {install_error}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
