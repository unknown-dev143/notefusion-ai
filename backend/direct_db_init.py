import sys
import os
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Define the database URL
DATABASE_URL = "sqlite:///./notefusion.db"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create a base class for declarative models
Base = declarative_base()

# Define the User model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create all tables
def create_tables():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def create_test_user():
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if test user already exists
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            # Simple but consistent password hashing for testing (don't use in production)
            import hashlib
            password = "testpass123"
            # Using SHA-256 for consistent hashing across different Python processes
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
            
            test_user = User(
                email="test@example.com",
                username="testuser",
                hashed_password=hashed_password,
                full_name="Test User",
                is_active=True
            )
            db.add(test_user)
            db.commit()
            print("✅ Test user created successfully!")
            print(f"   Email: test@example.com")
            print(f"   Password: testpass123")
        else:
            print("ℹ️ Test user already exists.")
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=== Database Initialization ===\n")
    create_tables()
    create_test_user()
    print("\n✅ Database setup completed!")
