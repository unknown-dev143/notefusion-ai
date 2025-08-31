import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.config import settings

async def test_db_connection():
    """Test database connection with retry logic."""
    max_retries = 5
    retry_delay = 2  # seconds
    
    # Get database URL from settings
    db_url = settings.DATABASE_URL
    print(f"Testing database connection to: {db_url}")
    
    # Create async engine
    engine = create_async_engine(
        db_url,
        echo=True,
        pool_pre_ping=True,
        pool_recycle=3600,
    )
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    for attempt in range(1, max_retries + 1):
        try:
            async with async_session() as session:
                # Test the connection with a simple query
                result = await session.execute(text("SELECT 1"))
                value = result.scalar()
                if value == 1:
                    print("✅ Database connection successful!")
                    return True
                else:
                    print(f"❌ Unexpected query result: {value}")
        except Exception as e:
            print(f"❌ Attempt {attempt}/{max_retries} failed: {str(e)}")
            if attempt < max_retries:
                print(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                print("❌ Max retries reached. Could not connect to database.")
                return False
    
    return False

if __name__ == "__main__":
    asyncio.run(test_db_connection())
