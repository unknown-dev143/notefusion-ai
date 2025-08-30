import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def test_connection():
    # Use an in-memory SQLite database for testing
    DATABASE_URL = "sqlite+aiosqlite:///./db/test.db"
    
    try:
        engine = create_async_engine(DATABASE_URL, echo=True)
        async with engine.begin() as conn:
            print("✅ Successfully connected to the database")
            
            # Create a simple table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS test_table (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL
                )
            """)
            print("✅ Successfully created test table")
            
            # Insert test data
            await conn.execute(
                "INSERT INTO test_table (name) VALUES ('test')"
            )
            print("✅ Successfully inserted test data")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection())
