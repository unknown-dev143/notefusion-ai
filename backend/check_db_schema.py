from sqlalchemy import create_engine, MetaData, Table, inspect
from sqlalchemy.orm import sessionmaker
import os

# Set up database connection
DATABASE_URL = "sqlite:///./notefusion.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_tables():
    """Check if required tables exist in the database."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("\n=== Database Tables ===")
    for table in tables:
        print(f"- {table}")
    
    required_tables = {'users', 'notes', 'sessions'}
    missing_tables = required_tables - set(tables)
    
    if missing_tables:
        print(f"\n❌ Missing tables: {', '.join(missing_tables)}")
    else:
        print("\n✅ All required tables exist")

def check_users_table():
    """Check the structure of the users table."""
    inspector = inspect(engine)
    if 'users' in inspector.get_table_names():
        print("\n=== Users Table Structure ===")
        columns = inspector.get_columns('users')
        for column in columns:
            print(f"- {column['name']}: {column['type']}")

if __name__ == "__main__":
    print("=== Checking Database Schema ===\n")
    check_tables()
    check_users_table()
