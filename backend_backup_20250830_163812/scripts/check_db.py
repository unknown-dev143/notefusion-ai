import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def check_database():
    # Create an async engine
    db_url = "sqlite+aiosqlite:///./test.db"
    engine = create_async_engine(db_url, echo=True)
    
    # Connect to the database and execute a query
    async with engine.connect() as conn:
        # Check if the ai_models table exists
        result = await conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table'")
        )
        tables = result.scalars().all()
        print("Tables in the database:", tables)
        
        # If ai_models table exists, count the number of models
        if 'ai_models' in tables:
            result = await conn.execute(
                text("SELECT COUNT(*) as count FROM ai_models")
            )
            count = result.scalar()
            print(f"Number of AI models in the database: {count}")
            
            # List all AI models
            result = await conn.execute(
                text("SELECT id, name, model_id, provider, is_available FROM ai_models")
            )
            print("\nAI Models:")
            print("ID  | Name               | Model ID                    | Provider  | Available")
            print("----|--------------------|-----------------------------|-----------|-----------")
            for row in result:
                print(f"{row[0]:<3} | {row[1]:<18} | {row[2]:<27} | {row[3]:<9} | {row[4]}")
    
    await engine.dispose()

if __name__ == "__main__":
    print("🔍 Checking database...")
    asyncio.run(check_database())
