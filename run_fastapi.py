import sys
import os

def check_environment():
    print("=== Python Environment Check ===")
    print(f"Python Version: {sys.version}")
    print(f"Current Directory: {os.getcwd()}")
    
    try:
        import fastapi
        print(f"FastAPI Version: {fastapi.__version__}")
    except ImportError:
        print("FastAPI is not installed. Installing...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn"])
        import fastapi
        print(f"FastAPI {fastapi.__version__} installed successfully!")

if __name__ == "__main__":
    check_environment()
    
    # Run the FastAPI test server
    print("\nStarting FastAPI test server...")
    print("Open http://localhost:8000 in your browser")
    print("Press Ctrl+C to stop the server\n")
    
    import uvicorn
    from fastapi import FastAPI
    
    app = FastAPI()
    
    @app.get("/")
    async def read_root():
        return {"message": "NoteFusion AI Backend is running!"}
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
