import sys
import os
import platform

def main():
    print("=== Python Environment Test ===\n")
    
    # Basic Python info
    print(f"Python Version: {sys.version}")
    print(f"Python Executable: {sys.executable}")
    print(f"Platform: {platform.platform()}")
    print(f"Current Working Directory: {os.getcwd()}")
    
    # Environment variables
    print("\n=== Environment Variables ===")
    for key in ['PATH', 'PYTHONPATH', 'PYTHONHOME']:
        value = os.environ.get(key, 'Not set')
        print(f"{key}: {value}")
    
    # Test imports
    print("\n=== Testing Imports ===")
    try:
        import fastapi
        print(f"FastAPI Version: {fastapi.__version__}")
    except ImportError:
        print("FastAPI is not installed")
    
    try:
        import uvicorn
        print(f"Uvicorn Version: {uvicorn.__version__}")
    except ImportError:
        print("Uvicorn is not installed")
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    main()
