from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo purposes
API_KEYS = {
    "test-api-key-123": "test-user"
}

# API Key header
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key not in API_KEYS:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key"
        )
    return api_key

@app.get("/api/test")
async def test_endpoint(api_key: str = Depends(get_api_key)):
    return {"message": "Authentication successful!", "user": API_KEYS[api_key]}

if __name__ == "__main__":
    uvicorn.run("test_auth_server:app", host="0.0.0.0", port=8000, reload=True)
