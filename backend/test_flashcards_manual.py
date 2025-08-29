import asyncio
import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, Database
from app.config.settings import settings
from app.models.user import User
from app.models.note import Note
from app.models.flashcard import Flashcard
from app.schemas.flashcard import FlashcardCreate, FlashcardReview
from app.crud.flashcard import CRUDFlashcard

# Test database URL
TEST_DB = "sqlite+aiosqlite:///./test_notefusion_manual.db"

# Override the database URL for testing
settings.DATABASE_URL = TEST_DB

async def main():
    print("Setting up test environment...")
    
    # Create engine and session
    engine = create_async_engine(TEST_DB, echo=True)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # Create test data
    async with AsyncSessionLocal() as db:
        print("\nCreating test user...")
        user = User(
            email="test@example.com",
            hashed_password="testpass",
            full_name="Test User"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        print("Creating test note...")
        note = Note(
            title="Test Note",
            content="This is a test note.",
            user_id=user.id
        )
        db.add(note)
        await db.commit()
        await db.refresh(note)
        
        # Test creating a flashcard
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
        await db.commit()
        await db.refresh(flashcard)
        
        print(f"Created flashcard: {flashcard.id}")
        print(f"Front: {flashcard.front_text}")
        print(f"Back: {flashcard.back_text}")
        
        # Test getting the flashcard
        print("\nRetrieving flashcard...")
        retrieved = await CRUDFlashcard().get(db, id=flashcard.id)
        print(f"Retrieved flashcard: {retrieved.id}")
        
        # Test reviewing the flashcard
        print("\nRecording flashcard review...")
        review = FlashcardReview(quality=4)  # Good recall
        reviewed = await CRUDFlashcard().record_review(
            db=db,
            db_obj=retrieved,
            review=review
        )
        await db.commit()
        await db.refresh(reviewed)
        
        print(f"Review recorded. New review count: {reviewed.review_count}")
        print(f"Next review in {reviewed.interval} days")
        
        # Test getting due cards
        print("\nGetting due cards...")
        due_cards = await CRUDFlashcard().get_due_cards(
            db=db,
            user_id=str(user.id)
        )
        print(f"Found {len(due_cards)} due cards")
        
        # Test getting stats
        print("\nGetting flashcard stats...")
        stats = await CRUDFlashcard().get_stats(
            db=db,
            user_id=str(user.id)
        )
        print(f"Stats: {stats}")
        
        print("\nAll tests completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
