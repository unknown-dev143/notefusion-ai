"""Integration tests for the Flashcard feature."""
import asyncio
import os
import sys
from datetime import datetime, timedelta
from typing import AsyncGenerator

import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models import Base, User, Note, Flashcard
from app.config import settings
from app.schemas.flashcard import FlashcardCreate, FlashcardUpdate, FlashcardReview
from app.crud.flashcard import CRUDFlashcard

# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_notefusion.db"

# Create test engine and session
engine = create_async_engine(TEST_DATABASE_URL, echo=True)
AsyncTestingSessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine, 
    class_=AsyncSession
)

# Test data
test_user_data = {
    "email": "test@example.com",
    "hashed_password": "testpassword",
    "full_name": "Test User",
}

test_note_data = {
    "title": "Test Note",
    "content": "This is a test note.",
}

test_flashcard_data = {
    "front_text": "What is the capital of France?",
    "back_text": "Paris",
    "tags": ["geography", "capitals"]
}

# Fixtures
@pytest.fixture(scope="module")
def event_loop():
    """Create an instance of the default event loop for the test module."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="module")
async def setup_db():
    """Set up test database and create tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # Create a test user and note
    async with AsyncTestingSessionLocal() as db:
        # Create test user
        user = User(**test_user_data)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        # Create test note
        note = Note(**test_note_data, user_id=user.id)
        db.add(note)
        await db.commit()
        await db.refresh(note)
        
        yield user, note
        
        # Cleanup
        await db.close()

@pytest.fixture
def db_session(setup_db) -> AsyncGenerator[AsyncSession, None]:
    """Create a new database session for a test."""
    async with AsyncTestingSessionLocal() as session:
        yield session

# Tests
class TestFlashcardCRUD:
    """Test CRUD operations for flashcards."""
    
    async def test_create_flashcard(self, setup_db, db_session):
        """Test creating a flashcard."""
        user, note = setup_db
        
        # Create flashcard
        flashcard_data = FlashcardCreate(
            note_id=str(note.id),
            **test_flashcard_data
        )
        
        flashcard = await CRUDFlashcard().create(
            db=db_session,
            obj_in=flashcard_data,
            user_id=str(user.id)
        )
        
        assert flashcard is not None
        assert flashcard.front_text == test_flashcard_data["front_text"]
        assert flashcard.back_text == test_flashcard_data["back_text"]
        assert flashcard.note_id == note.id
        assert flashcard.user_id == user.id
        assert flashcard.review_count == 0
        assert flashcard.ease_factor == 250  # Default ease factor (2.5 * 100)
        assert flashcard.interval == 1  # Default interval
        assert flashcard.due_date is not None
    
    async def test_get_flashcard(self, setup_db, db_session):
        """Test retrieving a flashcard by ID."""
        user, note = setup_db
        
        # Create a flashcard first
        flashcard_data = FlashcardCreate(
            note_id=str(note.id),
            **test_flashcard_data
        )
        created = await CRUDFlashcard().create(
            db=db_session,
            obj_in=flashcard_data,
            user_id=str(user.id)
        )
        
        # Retrieve the flashcard
        retrieved = await CRUDFlashcard().get(db=db_session, id=created.id)
        
        assert retrieved is not None
        assert retrieved.id == created.id
        assert retrieved.front_text == test_flashcard_data["front_text"]
    
    async def test_update_flashcard(self, setup_db, db_session):
        """Test updating a flashcard."""
        user, note = setup_db
        
        # Create a flashcard first
        flashcard_data = FlashcardCreate(
            note_id=str(note.id),
            **test_flashcard_data
        )
        created = await CRUDFlashcard().create(
            db=db_session,
            obj_in=flashcard_data,
            user_id=str(user.id)
        )
        
        # Update the flashcard
        update_data = FlashcardUpdate(
            front_text="Updated question",
            back_text="Updated answer",
            tags=["updated"]
        )
        updated = await CRUDFlashcard().update(
            db=db_session,
            db_obj=created,
            obj_in=update_data
        )
        
        assert updated is not None
        assert updated.id == created.id
        assert updated.front_text == "Updated question"
        assert updated.back_text == "Updated answer"
        assert updated.tags == ["updated"]
    
    async def test_record_review(self, setup_db, db_session):
        """Test recording a flashcard review."""
        user, note = setup_db
        
        # Create a flashcard first
        flashcard_data = FlashcardCreate(
            note_id=str(note.id),
            **test_flashcard_data
        )
        created = await CRUDFlashcard().create(
            db=db_session,
            obj_in=flashcard_data,
            user_id=str(user.id)
        )
        
        # Record a review with quality 4 (good)
        review_data = FlashcardReview(quality=4)
        reviewed = await CRUDFlashcard().record_review(
            db=db_session,
            db_obj=created,
            review=review_data
        )
        
        assert reviewed is not None
        assert reviewed.review_count == 1
        assert reviewed.last_reviewed is not None
        assert reviewed.interval > 1  # Interval should increase after a good review
    
    async def test_get_due_cards(self, setup_db, db_session):
        """Test retrieving due flashcards."""
        user, note = setup_db
        
        # Create a due flashcard
        due_flashcard = Flashcard(
            user_id=user.id,
            note_id=note.id,
            front_text="Due card",
            back_text="Answer",
            due_date=datetime.utcnow() - timedelta(days=1)  # Past due
        )
        db_session.add(due_flashcard)
        
        # Create a not-due flashcard
        not_due_flashcard = Flashcard(
            user_id=user.id,
            note_id=note.id,
            front_text="Not due card",
            back_text="Answer",
            due_date=datetime.utcnow() + timedelta(days=1)  # Future due date
        )
        db_session.add(not_due_flashcard)
        await db_session.commit()
        
        # Get due cards
        due_cards = await CRUDFlashcard().get_due_cards(
            db=db_session,
            user_id=str(user.id)
        )
        
        assert len(due_cards) == 1
        assert due_cards[0].front_text == "Due card"
    
    async def test_get_stats(self, setup_db, db_session):
        """Test getting flashcard statistics."""
        user, note = setup_db
        
        # Create some flashcards with different statuses
        flashcard1 = Flashcard(
            user_id=user.id,
            note_id=note.id,
            front_text="Card 1",
            back_text="Answer 1",
            due_date=datetime.utcnow() - timedelta(days=1)  # Due
        )
        
        flashcard2 = Flashcard(
            user_id=user.id,
            note_id=note.id,
            front_text="Card 2",
            back_text="Answer 2",
            due_date=datetime.utcnow() + timedelta(days=1),  # Not due
            review_count=1,
            ease_factor=250,
            interval=1
        )
        
        db_session.add_all([flashcard1, flashcard2])
        await db_session.commit()
        
        # Get stats
        stats = await CRUDFlashcard().get_stats(
            db=db_session,
            user_id=str(user.id)
        )
        
        assert stats["total_cards"] == 2
        assert stats["due_cards"] == 1
        assert stats["new_cards"] == 1
        assert stats["average_ease"] == 2.5  # 250 / 100
        assert stats["total_reviews"] == 1

# Run tests if executed directly
if __name__ == "__main__":
    import pytest
    import sys
    sys.exit(pytest.main([__file__] + sys.argv[1:]))
