from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

app = FastAPI(title="NoteFusion API", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory data store
notes = []

class NoteBase(BaseModel):
    title: str
    content: str

class Note(NoteBase):
    id: int

# API Endpoints
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/notes", response_model=List[Note])
async def get_notes():
    return notes

@app.post("/api/notes", response_model=Note, status_code=status.HTTP_201_CREATED)
async def create_note(note: NoteBase):
    note_dict = note.dict()
    note_dict["id"] = len(notes) + 1
    notes.append(note_dict)
    return note_dict

if __name__ == "__main__":
    uvicorn.run("minimal_backend:app", host="0.0.0.0", port=8000, reload=True)
