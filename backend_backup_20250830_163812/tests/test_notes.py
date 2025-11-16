import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.note import Note, Attachment, Folder
from app.schemas.note import NoteCreate, NoteUpdate, AttachmentCreate, FolderCreate

client = TestClient(app)

def test_create_note(test_db: Session, test_user: User):
    # Test creating a new note
    note_data = {
        "title": "Test Note",
        "content": "This is a test note",
        "tags": ["test", "pytest"]
    }
    
    response = client.post(
        "/api/notes/",
        json=note_data,
        headers={"Authorization": f"Bearer {test_user.id}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == note_data["title"]
    assert data["content"] == note_data["content"]
    assert data["user_id"] == test_user.id
    assert set(data["tags"]) == set(note_data["tags"])

def test_get_note(test_db: Session, test_user: User, test_note: Note):
    # Test retrieving a note
    response = client.get(
        f"/api/notes/{test_note.id}",
        headers={"Authorization": f"Bearer {test_user.id}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_note.id
    assert data["title"] == test_note.title

def test_update_note(test_db: Session, test_user: User, test_note: Note):
    # Test updating a note
    update_data = {
        "title": "Updated Note Title",
        "content": "Updated content"
    }
    
    response = client.put(
        f"/api/notes/{test_note.id}",
        json=update_data,
        headers={"Authorization": f"Bearer {test_user.id}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["content"] == update_data["content"]

def test_delete_note(test_db: Session, test_user: User, test_note: Note):
    # Test deleting a note
    response = client.delete(
        f"/api/notes/{test_note.id}",
        headers={"Authorization": f"Bearer {test_user.id}"}
    )
    
    assert response.status_code == 200
    
    # Verify the note is deleted
    response = client.get(
        f"/api/notes/{test_note.id}",
        headers={"Authorization": f"Bearer {test_user.id}"}
    )
    assert response.status_code == 404

# Add more test cases for attachments, folders, and edge cases
