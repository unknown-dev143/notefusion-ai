"""
Test database connection and basic models.
"""

import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Create a simple test model
Base = declarative_base()

class TestUser(Base):
    __tablename__ = "test_users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

def test_db_connection():
    """Test database connection and basic operations."""
    try:
        print("🚀 Starting database connection test...")
        
        # Use SQLite in-memory database for testing
        DATABASE_URL = "sqlite:///:memory:"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        # Create tables
        print("🔧 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Create a new session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Test: Create a user
        print("👤 Testing user creation...")
        test_user = TestUser(
            email="test@example.com",
            name="Test User"
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        print("✅ Successfully created test user")
        print(f"   User ID: {test_user.id}, Email: {test_user.email}")
        
        # Test: Query the user
        print("🔍 Testing user retrieval...")
        user = db.query(TestUser).filter(TestUser.email == "test@example.com").first()
        if user:
            print("✅ Successfully retrieved test user")
            print(f"   User ID: {user.id}, Name: {user.name}")
        else:
            print("❌ Failed to retrieve test user")
        
        # Clean up
        db.close()
        print("\n🎉 Database test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Database test failed: {e}")
        raise

if __name__ == "__main__":
    test_db_connection()
