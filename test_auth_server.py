import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import secrets
import time

# In-memory storage for API keys (use a database in production)
API_KEYS = {}

app = FastAPI(title="Test Auth Server")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API key header
api_key_header = APIKeyHeader(name="X-API-Key")

# Models
class NoteCreate(BaseModel):
    title: str
    content: str

class Note(NoteCreate):
    id: int
    created_at: float

# In-memory storage for notes
notes_db = []

# Authentication dependency
async def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key not in API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key",
        )
    return api_key

# Routes
@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "message": "Server is running"}

@app.post("/api/v1/auth/login")
async def login():
    # In a real app, this would verify username/password
    return {
        "access_token": "dummy_access_token",
        "token_type": "bearer"
    }

@app.post("/api/v1/auth/api-keys")
async def create_api_key():
    # In a real app, this would require authentication
    key_id = secrets.token_hex(8)
    key_secret = secrets.token_hex(16)
    api_key = f"{key_id}.{key_secret}"
    
    # Store the key (in memory, will be lost on server restart)
    API_KEYS[api_key] = {
        "key_id": key_id,
        "scopes": ["notes:read", "notes:write"],
        "created_at": time.time(),
        "rate_limit": 1000
    }
    
    return {
        "key_id": key_id,
        "key": api_key,
        "name": "Test API Key",
        "scopes": ["notes:read", "notes:write"],
        "rate_limit": 1000
    }

@app.get("/api/v1/notes/", response_model=List[Note])
async def list_notes(api_key: str = Depends(get_api_key)):
    return notes_db

@app.post("/api/v1/notes/", response_model=Note, status_code=status.HTTP_201_CREATED)
async def create_note(note: NoteCreate, api_key: str = Depends(get_api_key)):
    note_id = len(notes_db) + 1
    db_note = Note(
        id=note_id,
        title=note.title,
        content=note.content,
        created_at=time.time()
    )
    notes_db.append(db_note)
    return db_note

if __name__ == "__main__":
    print("🚀 Starting test authentication server...")
    print("   - Public endpoint: GET /api/v1/health")
    print("   - Login: POST /api/v1/auth/login")
    print("   - Create API key: POST /api/v1/auth/api-keys")
    print("   - List notes (requires API key): GET /api/v1/notes/")
    print("   - Create note (requires API key): POST /api/v1/notes/\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
