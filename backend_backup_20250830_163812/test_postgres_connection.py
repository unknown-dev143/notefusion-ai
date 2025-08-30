import os
import sys
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.config.settings import settings

async def test_connection():
    print(f"Testing connection to: {settings.DATABASE_URL}")
    
    try:
        # Create async engine
        engine = create_async_engine(
            str(settings.DATABASE_URL),
            echo=True,  # Enable SQL query logging
            pool_pre_ping=True  # Test connections before using them
        )
        
        # Test connection
        async with engine.connect() as conn:
            print("✅ Successfully connected to the database")
            
            # Test a simple query
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"📊 Database version: {version}")
            
            # Check if tables exist
            result = await conn.execute(
                text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                """)
            tables = [row[0] for row in result.fetchall()]
            print(f"📋 Tables in database: {tables}")
            
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
