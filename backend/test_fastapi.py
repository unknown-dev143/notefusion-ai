import uvicorn
import sys
import os
import sqlite3
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the FastAPI app
from main import app, get_db
from database import Base, engine, SessionLocal

# Create test database
TEST_DATABASE_URL = "sqlite:///./test_notefusion.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency for testing
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "NoteFusion API" in response.text

def test_register_user():
    import random
    import string
    
    # Generate a random email
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    test_email = f"test_{random_str}@example.com"
    
    # Test data
    user_data = {
        "email": test_email,
        "password": "testpass123",
        "full_name": "Test User"
    }
    
    # Test registration
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 200
    assert "email" in response.json()
    assert response.json()["email"] == test_email
    
    # Clean up
    db = next(override_get_db())
    user = db.query(User).filter(User.email == test_email).first()
    if user:
        db.delete(user)
        db.commit()
    
    return response.json()

if __name__ == "__main__":
    # Set up test database
    Base.metadata.create_all(bind=engine)
    
    try:
        print("=== Running FastAPI Tests ===")
        
        # Test root endpoint
        print("\nTesting root endpoint...")
        test_root()
        print("✅ Root endpoint test passed")
        
        # Test user registration
        print("\nTesting user registration...")
        user = test_register_user()
        print(f"✅ User registration test passed. Created user: {user['email']}")
        
        print("\n✅ All tests passed!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise
    finally:
        # Clean up test database
        Base.metadata.drop_all(bind=engine)
        if os.path.exists("test_notefusion.db"):
            os.remove("test_notefusion.db")
