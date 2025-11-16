import pytest
from fastapi import status, FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import uuid
from typing import Dict, Any

from app.main import app
from app.models.user import User
from app.models.flashcard import Flashcard
from app.schemas.flashcard import FlashcardCreate, FlashcardUpdate, FlashcardReview
from app.core.security import create_access_token
from app.api.deps import get_db as get_db_dep
from app.db.base_class import Base

# Test data
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123",
    "full_name": "Test User"
}

TEST_FLASHCARD = {
    "front_text": "What is the capital of France?",
    "back_text": "Paris",
    "tags": ["geography", "capitals"],
    "ease_factor": 2.5,
    "interval": 1,
    "repetitions": 0,
    "review_date": (datetime.utcnow() + timedelta(days=1)).isoformat()
}

# Fixtures
@pytest.fixture
def client(override_get_db):
    # Override the get_db dependency for testing
    app.dependency_overrides[get_db_dep] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    # Clean up after test
    app.dependency_overrides = {}

@pytest.fixture
async def test_user(db: AsyncSession):
    user = User(
        email=TEST_USER["email"],
        hashed_password=TEST_USER["password"],  # In a real test, hash the password
        full_name=TEST_USER["full_name"],
        is_active=True
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@pytest.fixture
async def test_flashcard(db: AsyncSession, test_user: User):
    flashcard_data = TEST_FLASHCARD.copy()
    flashcard_data["review_date"] = datetime.fromisoformat(flashcard_data["review_date"])
    
    flashcard = Flashcard(
        **flashcard_data,
        user_id=test_user.id
    )
    db.add(flashcard)
    await db.commit()
    await db.refresh(flashcard)
    return flashcard

@pytest.fixture
async def user_auth_headers(test_user: User):
    access_token = create_access_token(
        data={"sub": str(test_user.id)}
    )
    return {"Authorization": f"Bearer {access_token}"}

# Tests
class TestCreateFlashcard:
    @pytest.mark.asyncio
    async def test_create_flashcard_success(self, client, user_auth_headers):
        # Convert datetime to string for JSON serialization
        flashcard_data = TEST_FLASHCARD.copy()
        flashcard_data["review_date"] = flashcard_data["review_date"].isoformat()
        
        response = client.post(
            "/api/v1/flashcards/",
            json=flashcard_data,
            headers=user_auth_headers
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["front_text"] == TEST_FLASHCARD["front_text"]
        assert data["back_text"] == TEST_FLASHCARD["back_text"]
        assert data["tags"] == TEST_FLASHCARD["tags"]
        assert data["user_id"] is not None

    @pytest.mark.asyncio
    async def test_create_flashcard_unauthorized(self, client):
        # Convert datetime to string for JSON serialization
        flashcard_data = TEST_FLASHCARD.copy()
        flashcard_data["review_date"] = flashcard_data["review_date"].isoformat()
        
        response = client.post("/api/v1/flashcards/", json=flashcard_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

class TestGetFlashcard:
    async def test_get_flashcard_success(self, client, test_flashcard, user_auth_headers):
        response = client.get(
            f"/api/v1/flashcards/{test_flashcard.id}",
            headers=user_auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == str(test_flashcard.id)
        assert data["front_text"] == test_flashcard.front_text

    async def test_get_nonexistent_flashcard(self, client, user_auth_headers):
        non_existent_id = str(uuid.uuid4())
        response = client.get(
            f"/api/v1/flashcards/{non_existent_id}",
            headers=user_auth_headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

class TestUpdateFlashcard:
    async def test_update_flashcard_success(self, client, test_flashcard, user_auth_headers):
        update_data = {
            "front_text": "Updated question",
            "back_text": "Updated answer",
            "tags": ["updated"]
        }
        response = client.put(
            f"/api/v1/flashcards/{test_flashcard.id}",
            json=update_data,
            headers=user_auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["front_text"] == update_data["front_text"]
        assert data["back_text"] == update_data["back_text"]
        assert data["tags"] == update_data["tags"]

class TestDeleteFlashcard:
    async def test_delete_flashcard_success(self, client, test_flashcard, user_auth_headers, db: AsyncSession):
        response = client.delete(
            f"/api/v1/flashcards/{test_flashcard.id}",
            headers=user_auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        
        # Verify the flashcard is deleted
        deleted = await db.get(Flashcard, test_flashcard.id)
        assert deleted is None

class TestReviewFlashcard:
    async def test_review_flashcard_success(self, client, test_flashcard, user_auth_headers):
        review_data = {"quality": 4}
        response = client.post(
            f"/api/v1/flashcards/{test_flashcard.id}/review",
            json=review_data,
            headers=user_auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["repetitions"] == 1  # Should be incremented
        assert data["ease_factor"] != TEST_FLASHCARD["ease_factor"]  # Should be updated

class TestGetFlashcardStats:
    async def test_get_flashcard_stats(self, client, test_flashcard, user_auth_headers):
        response = client.get(
            "/api/v1/flashcards/stats/",
            headers=user_auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total_cards" in data
        assert "due_cards" in data
        assert "review_history" in data
