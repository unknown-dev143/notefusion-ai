import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def list_tables():
    # Create an async engine
    db_url = "sqlite+aiosqlite:///./test.db"
    engine = create_async_engine(db_url, echo=True)
    
    try:
        # Connect to the database
        async with engine.connect() as conn:
            # List all tables
            result = await conn.execute(
                text("SELECT name FROM sqlite_master WHERE type='table'")
            )
            tables = result.scalars().all()
            print("\nTables in the database:")
            for table in tables:
                print(f"- {table}")
                
                # For each table, count rows
                try:
                    count_result = await conn.execute(
                        text(f"SELECT COUNT(*) FROM {table}")
                    )
                    count = count_result.scalar()
                    print(f"  Rows: {count}")
                    
                    # List column names
                    col_result = await conn.execute(
                        text(f"PRAGMA table_info({table})")
                    )
                    columns = [row[1] for row in col_result]
                    print(f"  Columns: {', '.join(columns)}\n")
                except Exception as e:
                    print(f"  Error querying table {table}: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    print("📊 Listing database tables...")
    asyncio.run(list_tables())
