from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import uvicorn
import sys

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Test model
class TestResponse(BaseModel):
    status: str
    message: str

# Test endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Server is running"}

# Test auth endpoint
@app.post("/api/auth/register")
async def register():
    return {
        "status": "success",
        "message": "User registered successfully",
        "user_id": 1,
        "email": "test@example.com"
    }

# Test login endpoint
@app.post("/api/auth/login")
async def login():
    return {
        "status": "success",
        "access_token": "test_token_123",
        "token_type": "bearer"
    }

def run_server():
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True
    )
    server = uvicorn.Server(config)
    server.run()

if __name__ == "__main__":
    print("Starting test server on http://localhost:8000")
    print("Available endpoints:")
    print("  GET  /api/health")
    print("  POST /api/auth/register")
    print("  POST /api/auth/login")
    print("Press Ctrl+C to stop the server")
    try:
        run_server()
    except KeyboardInterrupt:
        print("\nServer stopped")
