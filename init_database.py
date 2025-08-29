"""Initialize the database with required tables."""
import asyncio
from app.models.database import init_db, drop_db

async def initialize_database():
    """Initialize the database with required tables."""
    print("Initializing database...")
    try:
        # Drop existing tables (be careful with this in production!)
        # await drop_db()
        
        # Create all tables
        await init_db()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(initialize_database())
