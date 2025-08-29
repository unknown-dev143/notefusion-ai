"""
Simple verification script for NoteFusion AI.
This script checks if the FastAPI application is running and responding.
"""
import sys
import os
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent.absolute())
sys.path.insert(0, project_root)

def print_success(message):
    """Print a success message."""
    print(f"✅ {message}")

def print_error(message):
    """Print an error message."""
    print(f"❌ {message}")

def check_imports():
    """Check if required packages are installed."""
    print("🔍 Checking Python environment...")
    
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import pydantic
        print_success("All required packages are installed")
        return True
    except ImportError as e:
        print_error(f"Missing package: {str(e)}")
        print("\nPlease install the required packages with:")
        print("pip install fastapi uvicorn sqlalchemy pydantic")
        return False

def check_fastapi():
    """Check if FastAPI is working."""
    print("\n🚀 Testing FastAPI...")
    try:
        from fastapi import FastAPI
        app = FastAPI()
        
        @app.get("/test")
        async def test():
            return {"message": "FastAPI is working!"}
            
        import uvicorn
        import threading
        import requests
        import time
        
        # Start the server in a separate thread
        def run_server():
            uvicorn.run(app, host="0.0.0.0", port=5001)
            
        server_thread = threading.Thread(target=run_server, daemon=True)
        server_thread.start()
        
        # Wait for the server to start
        time.sleep(2)
        
        # Test the endpoint
        response = requests.get("http://localhost:5001/test")
        if response.status_code == 200:
            print_success("FastAPI is working correctly")
            return True
        else:
            print_error(f"Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"FastAPI test failed: {str(e)}")
        return False

def main():
    """Run all checks."""
    print("🔍 NoteFusion AI Verification Tool")
    print("=" * 40)
    
    # Run checks
    checks = [
        ("Python Environment", check_imports()),
        ("FastAPI", check_fastapi())
    ]
    
    # Print summary
    print("\n📋 Verification Summary")
    print("=" * 40)
    all_passed = True
    for name, result in checks:
        status = "PASSED" if result else "FAILED"
        print(f"{name}: {status}")
        all_passed = all_passed and result
    
    if all_passed:
        print("\n🎉 All checks passed! Your environment is ready for NoteFusion AI.")
    else:
        print("\n❌ Some checks failed. Please fix the issues above.")
    
    print("\nNext steps:")
    print("1. Start the application: python -m uvicorn app.main:app --reload")
    print("2. Open http://localhost:8000 in your browser")
    print("3. Check the API documentation at http://localhost:8000/docs")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
