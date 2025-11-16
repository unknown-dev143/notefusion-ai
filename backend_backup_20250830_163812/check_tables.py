"""
Script to verify database connection and check if user_tasks table exists.
"""
import os
import sys
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import database configuration
from app.config import settings

def check_database():
    """Check database connection and list tables."""
    try:
        # Create a synchronous engine for testing
        sync_database_url = settings.DATABASE_URL.replace(
            "postgresql+asyncpg", "postgresql"
        ).replace(
            "sqlite+aiosqlite", "sqlite"
        )
        
        print(f"Connecting to database: {sync_database_url}")
        engine = create_engine(sync_database_url)
        
        # Create an inspector
        inspector = inspect(engine)
        
        # Get the list of tables
        tables = inspector.get_table_names()
        
        print("\nTables in the database:")
        for table in tables:
            print(f"- {table}")
            
            # Get columns for each table
            columns = inspector.get_columns(table)
            for column in columns:
                print(f"  - {column['name']}: {column['type']}")
        
        # Check if user_tasks table exists
        if 'user_tasks' in tables:
            print("\n✅ user_tasks table exists!")
        else:
            print("\n❌ user_tasks table does not exist!")
            
    except Exception as e:
        print(f"\n❌ Error connecting to the database: {e}")
        
        # Try to connect to SQLite directly as a fallback
        if "sqlite" in settings.DATABASE_URL:
            try:
                db_path = settings.DATABASE_URL.split("sqlite:///")[1]
                print(f"\nTrying to connect to SQLite directly at: {db_path}")
                
                import sqlite3
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                
                # List all tables
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = cursor.fetchall()
                
                print("\nTables in SQLite database:")
                for table in tables:
                    print(f"- {table[0]}")
                
                conn.close()
                
            except Exception as e2:
                print(f"\n❌ Error connecting to SQLite directly: {e2}")

if __name__ == "__main__":
    check_database()
