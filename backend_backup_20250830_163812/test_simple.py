import sys
import os

def main():
    print("=== Python Environment Test ===")
    print(f"Python Version: {sys.version}")
    print(f"Python Executable: {sys.executable}")
    print(f"Current Working Directory: {os.getcwd()}")
    print("\n=== Environment Variables ===")
    for key, value in os.environ.items():
        if 'PYTHON' in key or 'PATH' in key or 'VIRTUAL' in key.upper():
            print(f"{key}: {value}")
    
    print("\n=== Import Test ===")
    try:
        import fastapi
        import uvicorn
        import requests
        print("✓ All required packages are installed")
    except ImportError as e:
        print(f"✗ Missing package: {e}")
        print("\nRun: pip install fastapi uvicorn[standard] requests")

if __name__ == "__main__":
    main()
