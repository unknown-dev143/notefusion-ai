import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

def test_database_connection():
    print("Testing database connection...")
    try:
        # Create a new database engine
        DATABASE_URL = "sqlite:///./notefusion_new.db"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        # Try to connect to the database
        with engine.connect() as connection:
            print("✅ Successfully connected to the database")
            
            # Check if tables exist
            tables = connection.execute("SELECT name FROM sqlite_master WHERE type='table';")
            print("\nTables in the database:")
            for table in tables:
                print(f"- {table[0]}")
                
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        return False
    return True

if __name__ == "__main__":
    print("=== Testing Database Connection ===")
    if test_database_connection():
        print("\n✅ Database connection test completed successfully")
    else:
        print("\n❌ Database connection test failed")
