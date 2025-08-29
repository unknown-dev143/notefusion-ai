import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models import Base, User, Note, Flashcard
from app.config import settings
from app.schemas.flashcard import FlashcardCreate, FlashcardReview
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

async def init_db():
    """Initialize the test database with tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

async def create_test_user():
    """Create a test user and return the user object."""
    async with AsyncTestingSessionLocal() as db:
        user = User(**test_user_data)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

async def create_test_note(user_id: int):
    """Create a test note and return the note object."""
    async with AsyncTestingSessionLocal() as db:
        note = Note(**test_note_data, user_id=user_id)
        db.add(note)
        await db.commit()
        await db.refresh(note)
        return note

async def test_flashcard_crud():
    """Test CRUD operations for flashcards."""
    print("\n=== Testing Flashcard CRUD Operations ===")
    
    # Initialize database
    await init_db()
    
    # Create test user and note
    user = await create_test_user()
    note = await create_test_note(user.id)
    
    # Test create
    print("\nTesting flashcard creation...")
    flashcard_data = FlashcardCreate(
        note_id=str(note.id),
        **test_flashcard_data
    )
    
    async with AsyncTestingSessionLocal() as db:
        flashcard = await CRUDFlashcard().create(db, obj_in=flashcard_data, user_id=str(user.id))
        print(f"Created flashcard: {flashcard.id}")
        
        # Test get
        retrieved = await CRUDFlashcard().get(db, id=flashcard.id)
        assert retrieved is not None
        assert retrieved.front_text == test_flashcard_data["front_text"]
        print("✓ Flashcard retrieval test passed")
        
        # Test review
        review = FlashcardReview(quality=4)
        reviewed = await CRUDFlashcard().record_review(db, db_obj=retrieved, review=review)
        assert reviewed.review_count == 1
        assert reviewed.last_reviewed is not None
        print("✓ Flashcard review test passed")
        
        # Test get due cards
        due_cards = await CRUDFlashcard().get_due_cards(db, user_id=str(user.id))
        assert len(due_cards) > 0
        print("✓ Get due cards test passed")
        
        # Test get stats
        stats = await CRUDFlashcard().get_stats(db, user_id=str(user.id))
        assert stats["total_cards"] > 0
        print("✓ Get stats test passed")
        
        # Test delete
        await CRUDFlashcard().delete(db, id=flashcard.id)
        deleted = await CRUDFlashcard().get(db, id=flashcard.id)
        assert deleted is None
        print("✓ Flashcard deletion test passed")

async def main():
    """Run all tests."""
    try:
        await test_flashcard_crud()
        print("\n✓ All tests passed successfully!")
    except Exception as e:
        print(f"\n✗ Test failed: {str(e)}")
        raise
    finally:
        # Clean up
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
