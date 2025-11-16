import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import models to create tables
from app.models.base import Base
from app.database import engine

def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        return False
    return True

if __name__ == "__main__":
    print("=== Initializing Database Tables ===\n")
    if create_tables():
        print("\n✅ Database initialization completed successfully!")
    else:
        print("\n❌ Database initialization failed.")
