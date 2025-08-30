import asyncio
from app.models.database import init_db, SessionLocal
from app.config import settings

async def test_db_connection():
    print("Testing database connection...")
    try:
        # Initialize database
        await init_db()
        print("✅ Database initialization successful")
        
        # Test database connection
        async with SessionLocal() as session:
            result = await session.execute("SELECT 1")
            print(f"✅ Database connection test: {result.scalar() == 1}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    finally:
        print("Test completed")

if __name__ == "__main__":
    asyncio.run(test_db_connection())
