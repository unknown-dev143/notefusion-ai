"""Integration tests for note-related endpoints."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import io

from app.main import app
from app.database import get_db
from app.models.user import User
from app.models.note import Note

client = TestClient(app)

def test_create_and_retrieve_note(test_db: Session, test_user: User):
    """Test creating and retrieving a note."""
    # Create a note
    note_data = {
        "title": "Integration Test Note",
        "content": "This is an integration test note",
        "tags": ["integration", "test"]
    }
    
    # Test authentication
    response = client.post("/api/notes/", json=note_data)
    assert response.status_code == 401  # Unauthorized
    
    # Create with authentication
    headers = {"Authorization": f"Bearer {test_user.id}"}
    response = client.post("/api/notes/", json=note_data, headers=headers)
    assert response.status_code == 200
    
    # Verify the response
    created_note = response.json()
    assert created_note["title"] == note_data["title"]
    assert created_note["content"] == note_data["content"]
    assert set(created_note["tags"]) == set(note_data["tags"])
    assert created_note["user_id"] == test_user.id
    
    # Retrieve the note
    response = client.get(f"/api/notes/{created_note['id']}", headers=headers)
    assert response.status_code == 200
    retrieved_note = response.json()
    assert retrieved_note["id"] == created_note["id"]
    assert retrieved_note["title"] == created_note["title"]

def test_upload_attachment(test_db: Session, test_user: User, test_note: Note):
    """Test uploading an attachment to a note."""
    # Prepare test file
    test_file = (io.BytesIO(b"test file content"), "test.txt")
    
    # Test upload without authentication
    response = client.post(
        f"/api/notes/{test_note.id}/attachments",
        files={"file": test_file}
    )
    assert response.status_code == 401  # Unauthorized
    
    # Test upload with authentication
    headers = {"Authorization": f"Bearer {test_user.id}"}
    response = client.post(
        f"/api/notes/{test_note.id}/attachments",
        files={"file": test_file},
        headers=headers
    )
    
    # Verify the response
    assert response.status_code == 200
    attachment = response.json()
    assert attachment["filename"] == "test.txt"
    assert attachment["note_id"] == test_note.id
    assert "file_url" in attachment

def test_generate_note_content(test_db: Session, test_user: User, test_note: Note):
    """Test generating note content using AI."""
    # Prepare test data
    prompt_data = {
        "prompt": "Expand this note",
        "language": "en",
        "style": "professional"
    }
    
    headers = {"Authorization": f"Bearer {test_user.id}"}
    
    # Test content generation
    response = client.post(
        f"/api/notes/{test_note.id}/generate",
        json=prompt_data,
        headers=headers
    )
    
    # Verify the response
    assert response.status_code == 200
    updated_note = response.json()
    assert updated_note["id"] == test_note.id
    assert len(updated_note["content"]) > len(test_note.content)

# Add more integration tests for other endpoints and edge cases
