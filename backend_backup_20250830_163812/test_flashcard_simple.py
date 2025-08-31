import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

# Create a simple test database
TEST_DB = "sqlite+aiosqlite:///./test_flashcards_simple.db"
Base = declarative_base()

# Define a simple User model
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)

# Define a simple Note model
class Note(Base):
    __tablename__ = 'notes'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))

# Define a simple Flashcard model
class Flashcard(Base):
    __tablename__ = 'flashcards'
    id = Column(Integer, primary_key=True, index=True)
    front_text = Column(String, index=True)
    back_text = Column(String)
    note_id = Column(Integer, ForeignKey('notes.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    next_review = Column(DateTime, default=datetime.utcnow)
    review_count = Column(Integer, default=0)
    ease_factor = Column(Integer, default=250)  # 2.5 * 100 to avoid floating point

async def main():
    print("🚀 Starting simple flashcard test...")
    
    # Create engine and tables
    engine = create_async_engine(TEST_DB, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        # Create a test user
        print("\n🔧 Creating test user...")
        user = User(
            email="test@example.com",
            hashed_password="hashed_password_123",
            full_name="Test User"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        # Create a test note
        print("📝 Creating test note...")
        note = Note(
            title="Test Note",
            content="This is a test note",
            user_id=user.id
        )
        db.add(note)
        await db.commit()
        await db.refresh(note)
        
        # Create a test flashcard
        print("\n🃏 Creating test flashcard...")
        flashcard = Flashcard(
            front_text="What is the capital of France?",
            back_text="Paris",
            note_id=note.id,
            user_id=user.id
        )
        db.add(flashcard)
        await db.commit()
        await db.refresh(flashcard)
        
        print(f"\n✅ Success! Created flashcard with ID: {flashcard.id}")
        print(f"   Front: {flashcard.front_text}")
        print(f"   Back: {flashcard.back_text}")
        print(f"   Note ID: {flashcard.note_id}")
        print(f"   User ID: {flashcard.user_id}")
        
        # Verify we can retrieve the flashcard
        print("\n🔍 Verifying flashcard retrieval...")
        result = await db.get(Flashcard, flashcard.id)
        if result:
            print(f"✅ Successfully retrieved flashcard with ID: {result.id}")
            print(f"   Front: {result.front_text}")
            print(f"   Back: {result.back_text}")
        else:
            print("❌ Failed to retrieve flashcard")
    
    print("\n🎉 Test completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
