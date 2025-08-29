"""
Simple test script to verify FastAPI is working.
"""
import uvicorn
from fastapi import FastAPI
import os

def create_app():
    """Create a minimal FastAPI application for testing."""
    app = FastAPI()
    
    @app.get("/")
    async def read_root():
        return {"message": "Hello, NoteFusion AI!"}
    
    @app.get("/health")
    async def health_check():
        return {"status": "ok"}
    
    return app

if __name__ == "__main__":
    print("🚀 Starting FastAPI test server...")
    print(f"📁 Working directory: {os.getcwd()}")
    print("🌐 Server will be available at: http://localhost:5000")
    print("📋 Endpoints:")
    print("  - GET /          - Simple hello message")
    print("  - GET /health    - Health check endpoint")
    print("\nPress Ctrl+C to stop the server\n")
    
    uvicorn.run(
        "test_hello:create_app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        factory=True
    )
