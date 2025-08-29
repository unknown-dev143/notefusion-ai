import sys
import os

def main():
    print("=== Python Environment Check ===\n")
    
    # Check Python version
    print(f"Python Version: {sys.version}")
    print(f"Python Executable: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Check if we can import required modules
    print("\n=== Checking Imports ===")
    modules = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'pydantic',
        'python-jose',
        'passlib',
        'python-multipart',
        'python-dotenv',
        'email-validator',
        'aiosqlite'
    ]
    
    for module in modules:
        try:
            __import__(module)
            print(f"✓ {module}")
        except ImportError:
            print(f"✗ {module} (not found)")
    
    # Try to import the FastAPI app
    print("\n=== Checking FastAPI App ===")
    try:
        from app.main import app
        print("✓ Successfully imported FastAPI app"
              f"\n   App Name: {app.title}"
              f"\n   Version: {app.version}")
    except Exception as e:
        print(f"✗ Failed to import FastAPI app: {str(e)}")
        print("\n=== Error Details ===")
        import traceback
        traceback.print_exc()
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
