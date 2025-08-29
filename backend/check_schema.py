import asyncio
import sqlite3
from sqlalchemy import inspect
from app.models.database import engine, Base
from app.models.user import User
from app.models.task import Task
from app.models.subscription_models import Subscription, Invoice
from app.models.ai_models import DBAIModel, UserAIModelSettings

async def check_schema():
    # Create all tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Check the database schema
    async with engine.connect() as conn:
        # Get the database inspector
        inspector = await conn.run_sync(
            lambda sync_conn: inspect(sync_conn)
        )
        
        # List all tables
        tables = await conn.run_sync(
            lambda sync_conn: inspector.get_table_names()
        )
        
        print("\n=== Database Schema ===")
        print(f"Found {len(tables)} tables: {', '.join(tables)}\n")
        
        # Check each table's columns
        for table_name in tables:
            print(f"Table: {table_name}")
            columns = await conn.run_sync(
                lambda sync_conn, tn=table_name: inspector.get_columns(tn, connection=sync_conn)
            )
            
            for column in columns:
                print(f"  - {column['name']}: {column['type']}", end="")
                if column.get('primary_key'):
                    print(" (PK)", end="")
                if column.get('nullable') is False:
                    print(" (NOT NULL)", end="")
                if column.get('default') is not None:
                    print(f" (default: {column['default']})", end="")
                print()
            print()
        
        # Check if our migration was applied
        try:
            result = await conn.execute(
                "SELECT version_num FROM alembic_version"
            )
            version = await result.scalar()
            print(f"\nCurrent Alembic version: {version}")
        except Exception as e:
            print("\nAlembic version table not found. Run 'alembic upgrade head' to apply migrations.")

if __name__ == "__main__":
    asyncio.run(check_schema())
