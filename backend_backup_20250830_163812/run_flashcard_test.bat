@echo off
echo Checking Python environment...
python -c "import sys; print(f'Python {sys.version}')"

if %ERRORLEVEL% NEQ 0 (
    echo Python is not in your PATH or not installed.
    exit /b 1
)

echo.
echo Installing required packages...
pip install sqlalchemy aiosqlite

echo.
echo Running flashcard test...
python -c "
import asyncio
import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.user import User
from app.models.note import Note
from app.models.flashcard import Flashcard
from app.schemas.flashcard import FlashcardCreate, FlashcardReview
from app.crud.flashcard import CRUDFlashcard

async def test_flashcards():
    print('🚀 Starting flashcard test...')
    
    # Test database URL
    TEST_DB = 'sqlite+aiosqlite:///./test_flashcards.db'
    
    # Create engine and session
    engine = create_async_engine(TEST_DB, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        print('\n🔧 Creating test user...')
        user = User(
            email='test@example.com',
            hashed_password='testpass',
            full_name='Test User'
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        print('📝 Creating test note...')
        note = Note(
            title='Test Note',
            content='This is a test note about programming concepts.',
            user_id=user.id
        )
        db.add(note)
        await db.commit()
        await db.refresh(note)
        
        print('\n🃏 Testing flashcard creation...')
        flashcard_data = FlashcardCreate(
            note_id=str(note.id),
            front_text='What is the capital of France?',
            back_text='Paris',
            tags=['geography', 'capitals']
        )
        
        flashcard = await CRUDFlashcard().create(
            db=db,
            obj_in=flashcard_data,
            user_id=str(user.id)
        )
        await db.commit()
        await db.refresh(flashcard)
        
        print('\n✅ Flashcard created successfully!')
        print(f'   ID: {flashcard.id}')
        print(f'   Front: {flashcard.front_text}')
        print(f'   Back: {flashcard.back_text}')
        print(f'   Tags: {", ".join(flashcard.tags)}')
        print(f'   User ID: {flashcard.user_id}')
        print(f'   Note ID: {flashcard.note_id}')
        
        print('\n🔍 Testing flashcard retrieval...')
        retrieved = await CRUDFlashcard().get(db, id=flashcard.id)
        print(f'   Retrieved flashcard: {retrieved.id if retrieved else "Not found"}')
        
        print('\n⭐ Testing flashcard review...')
        review = FlashcardReview(quality=4)  # Good recall
        reviewed = await CRUDFlashcard().record_review(
            db=db,
            db_obj=flashcard,
            review=review
        )
        await db.commit()
        await db.refresh(reviewed)
        
        print(f'   Review recorded! New review count: {reviewed.review_count}')
        print(f'   Next review in {reviewed.interval} days')
        
        print('\n📊 Testing due cards...')
        due_cards = await CRUDFlashcard().get_due_cards(
            db=db,
            user_id=str(user.id)
        )
        print(f'   Found {len(due_cards)} due cards')
        
        print('\n📈 Testing flashcard stats...')
        stats = await CRUDFlashcard().get_stats(
            db=db,
            user_id=str(user.id)
        )
        print(f'   Stats: {stats}')
        
        print('\n🎉 All tests completed successfully!')

# Run the test
import asyncio
asyncio.run(test_flashcards())
"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Test completed successfully!
) else (
    echo.
    echo Test failed with error code %ERRORLEVEL%
)

pause
