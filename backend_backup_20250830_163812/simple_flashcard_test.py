"""Simple test script for Flashcard functionality."""
import asyncio
import os
import sys
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Import models and schemas
from app.models import Base, User, Note, Flashcard
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

async def init_db():
    """Initialize the test database with tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

async def create_test_data():
    """Create test data and return user and note objects."""
    async with AsyncTestingSessionLocal() as db:
        # Create test user
        user = User(
            email="test@example.com",
            hashed_password="testpassword",
            full_name="Test User",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        # Create test note
        note = Note(
            title="Test Note",
            content="This is a test note.",
            user_id=user.id
        )
        db.add(note)
        await db.commit()
        await db.refresh(note)
        
        return user, note

async def test_flashcard_crud():
    """Test basic CRUD operations for flashcards."""
    print("\n=== Starting Flashcard CRUD Tests ===")
    
    # Initialize database
    await init_db()
    
    # Create test data
    user, note = await create_test_data()
    
    async with AsyncTestingSessionLocal() as db:
        # Test create
        print("\nTesting flashcard creation...")
        flashcard_data = FlashcardCreate(
            note_id=str(note.id),
            front_text="What is the capital of France?",
            back_text="Paris",
            tags=["geography", "capitals"]
        )
        
        flashcard = await CRUDFlashcard().create(
            db=db,
            obj_in=flashcard_data,
            user_id=str(user.id)
        )
        
        print(f"Created flashcard with ID: {flashcard.id}")
        assert flashcard is not None
        assert flashcard.front_text == "What is the capital of France?"
        
        # Test get
        print("\nTesting flashcard retrieval...")
        retrieved = await CRUDFlashcard().get(db, id=flashcard.id)
        assert retrieved is not None
        assert retrieved.id == flashcard.id
        print(f"Retrieved flashcard with ID: {retrieved.id}")
        
        # Test review
        print("\nTesting flashcard review...")
        review = FlashcardReview(quality=4)  # Good recall
        reviewed = await CRUDFlashcard().record_review(
            db=db,
            db_obj=retrieved,
            review=review
        )
        assert reviewed.review_count == 1
        assert reviewed.last_reviewed is not None
        print(f"Reviewed flashcard. New review count: {reviewed.review_count}")
        
        # Test get due cards
        print("\nTesting retrieval of due cards...")
        due_cards = await CRUDFlashcard().get_due_cards(
            db=db,
            user_id=str(user.id)
        )
        assert len(due_cards) > 0
        print(f"Found {len(due_cards)} due cards")
        
        # Test get stats
        print("\nTesting flashcard statistics...")
        stats = await CRUDFlashcard().get_stats(
            db=db,
            user_id=str(user.id)
        )
        assert stats["total_cards"] > 0
        print(f"Flashcard stats: {stats}")
        
        print("\n✓ All tests passed!")

if __name__ == "__main__":
    asyncio.run(test_flashcard_crud())
