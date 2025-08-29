import sys
import os
import asyncio
from dotenv import load_dotenv

print("=== Debug Information ===")
print(f"Python Version: {sys.version}")
print(f"Current Working Directory: {os.getcwd()}")

# Load environment variables
load_dotenv()
print("\nEnvironment Variables:")
for key in ['ENVIRONMENT', 'DATABASE_URL', 'SECRET_KEY']:
    print(f"{key}: {'***' if key == 'SECRET_KEY' else os.getenv(key, 'Not set')}")

# Test database connection
print("\nTesting database connection...")
try:
    from sqlalchemy import create_async_engine
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite+aiosqlite:///./notefusion.db')
    
    # For SQLite, we need to use aiosqlite for async operations
    if DATABASE_URL.startswith('sqlite'):
        if 'aiosqlite' not in DATABASE_URL:
            DATABASE_URL = DATABASE_URL.replace('sqlite://', 'sqlite+aiosqlite://')
    
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async def test_db():
        try:
            async with engine.connect() as conn:
                print("✅ Successfully connected to the database!")
                # Try to create tables
                from app.models import Base
                print("Creating tables...")
                async with engine.begin() as conn:
                    await conn.run_sync(Base.metadata.create_all)
                print("✅ Tables created successfully!")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
    
    asyncio.run(test_db())
    
except Exception as e:
    print(f"❌ Error setting up database: {e}")

print("\nDebug information complete.")
