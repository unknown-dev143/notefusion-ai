import os
import sys
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Use SQLite for testing
DATABASE_URL = "sqlite+aiosqlite:///./notefusion.db"

async def test_connection():
    print(f"Testing connection to: {DATABASE_URL}")
    
    try:
        # Create async engine
        engine = create_async_engine(
            DATABASE_URL,
            echo=True,  # Enable SQL query logging
            connect_args={"check_same_thread": False}  # SQLite specific
        )
        
        # Test connection
        async with engine.connect() as conn:
            print("✅ Successfully connected to the database")
            
            # Test a simple query
            result = await conn.execute(text("SELECT sqlite_version()"))
            version = result.scalar()
            print(f"📊 SQLite version: {version}")
            
            # Check if tables exist
            try:
                result = await conn.execute(
                    text("SELECT name FROM sqlite_master WHERE type='table'"))
                tables = [row[0] for row in result.fetchall()]
                print(f"📋 Tables in database: {tables}")
            except Exception as e:
                print(f"⚠️ Could not list tables: {e}")
            
        return True
        
    except Exception as e:
        print(f"❌ Database connection error: {e}", file=sys.stderr)
        return False
    finally:
        if 'engine' in locals():
            await engine.dispose()

if __name__ == "__main__":
    # Set up logging
    import logging
    logging.basicConfig(level=logging.INFO)
    
    # Run the test
    asyncio.run(test_connection())
