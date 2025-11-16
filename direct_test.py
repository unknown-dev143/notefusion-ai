import sys
import os

def main():
    print("="*50)
    print("Direct FastAPI Test")
    print("="*50)
    
    # Print environment information
    print("\nPython Environment:")
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {sys.version}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Try to import required packages
    print("\nChecking dependencies...")
    try:
        import fastapi
        print(f"✅ FastAPI {fastapi.__version__} is installed")
    except ImportError:
        print("❌ FastAPI is not installed")
    
    try:
        import uvicorn
        print(f"✅ Uvicorn {uvicorn.__version__} is installed")
    except ImportError:
        print("❌ Uvicorn is not installed")
    
    # Run a simple FastAPI app if all dependencies are available
    try:
        import fastapi
        import uvicorn
        
        print("\n" + "="*50)
        print("Starting FastAPI Server...")
        print("="*50)
        
        app = fastapi.FastAPI()
        
        @app.get("/")
        async def root():
            return {"message": "FastAPI is working!"}
            
        print("\nServer will be available at: http://localhost:8000")
        print("Press Ctrl+C to stop the server\n")
        
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
        
    except Exception as e:
        print(f"\nError: {e}")
        print("\nPlease make sure all dependencies are installed:")
        print("pip install fastapi uvicorn")

if __name__ == "__main__":
    main()
