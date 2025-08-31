import sys
import uvicorn
from fastapi import FastAPI

def log(message):
    with open('debug.log', 'a') as f:
        f.write(f"{message}\n")

try:
    log("=== Starting FastAPI Debug ===")
    log(f"Python version: {sys.version}")
    log(f"Executable: {sys.executable}")
    
    app = FastAPI()
    
    @app.get("/")
    async def root():
        log("Root endpoint called")
        return {"message": "FastAPI is working!"}
    
    log("Starting Uvicorn server...")
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="debug",
        reload=True
    )
    server = uvicorn.Server(config)
    log("Uvicorn server configured")
    
    log("Starting server...")
    server.run()
    
except Exception as e:
    error_msg = f"Error: {type(e).__name__}: {str(e)}"
    log(error_msg)
    print(error_msg, file=sys.stderr)
