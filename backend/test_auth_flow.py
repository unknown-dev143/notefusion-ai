import sys
import os
import json
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set environment variables for testing
os.environ["SECRET_KEY"] = "test-secret-key-1234567890"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"
os.environ["DATABASE_URL"] = "sqlite:///./notefusion.db"
os.environ["BACKEND_CORS_ORIGINS"] = json.dumps([])

from app.database import Base, get_db, engine
from app.main import app
from app.models.user import User
from app.core.security import get_password_hash

# Test database setup - using the same database as the main app
SQLALCHEMY_DATABASE_URL = "sqlite:///./notefusion.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test database tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_register_and_login():
    # Clear existing test data
    db = next(override_get_db())
    db.query(User).delete()
    db.commit()
    
    # Test user data
    user_data = {
        "email": "test@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    }
    
    # Test registration
    print("1. Testing registration...")
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 200, f"Registration failed: {response.text}"
    print("   ✅ Registration successful")
    
    # Test login
    print("\n2. Testing login...")
    login_data = {
        "username": user_data["email"],
        "password": user_data["password"],
    }
    response = client.post(
        "/api/auth/token",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["access_token"]
    print(f"   ✅ Login successful. Token: {token[:30]}...")
    
    # Test protected route
    print("\n3. Testing protected route...")
    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Protected route failed: {response.text}"
    user_info = response.json()
    assert user_info["email"] == user_data["email"]
    print(f"   ✅ Protected route successful. User: {user_info}")
    
    print("\n✅ All tests passed!")

if __name__ == "__main__":
    print("=== Starting Authentication Flow Test ===\n")
    test_register_and_login()
