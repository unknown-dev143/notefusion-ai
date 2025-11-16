import sys
import os
import random
import string
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the FastAPI app and models
from main import app
from database import Base, engine, get_db
from app.models.user import User

# Create test database
TEST_DATABASE_URL = "sqlite:///./test_auth.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

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

def setup_test_database():
    # Create all tables
    Base.metadata.create_all(bind=test_engine)
    
    # Create a test user
    db = next(override_get_db())
    
    # Generate a random email
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    test_email = f"test_{random_str}@example.com"
    
    # Create test user
    test_user = User(
        email=test_email,
        hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # password: testpass
        full_name="Test User",
        is_active=True
    )
    
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    return test_user, test_email

def cleanup_test_database():
    # Drop all tables
    Base.metadata.drop_all(bind=test_engine)
    
    # Remove the test database file
    if os.path.exists("test_auth.db"):
        os.remove("test_auth.db")

def test_register():
    print("\nTesting user registration...")
    
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
    assert response.status_code == 200, f"Registration failed: {response.text}"
    assert "email" in response.json(), "Email not in response"
    assert response.json()["email"] == test_email, "Email in response doesn't match"
    
    print("✅ User registration test passed")
    return response.json()

def test_login(email: str, password: str):
    print("\nTesting user login...")
    
    # Test login with form data
    login_data = {
        "username": email,
        "password": password,
    }
    
    # Test login
    response = client.post(
        "/auth/token",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    assert response.status_code == 200, f"Login failed: {response.text}"
    assert "access_token" in response.json(), "Access token not in response"
    assert response.json()["token_type"] == "bearer", "Invalid token type"
    
    print("✅ User login test passed")
    return response.json()

def test_protected_route(access_token: str):
    print("\nTesting protected route...")
    
    # Test accessing a protected route
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 200, f"Access to protected route failed: {response.text}"
    assert "email" in response.json(), "User data not in response"
    
    print("✅ Protected route test passed")
    return response.json()

if __name__ == "__main__":
    try:
        print("=== Starting Authentication API Tests ===")
        
        # Set up test database and create a test user
        test_user, test_email = setup_test_database()
        
        # Run tests
        try:
            # Test registration
            registered_user = test_register()
            
            # Test login with the registered user
            login_data = test_login(registered_user["email"], "testpass123")
            
            # Test protected route with the access token
            user_data = test_protected_route(login_data["access_token"])
            
            print("\n✅ All authentication tests passed!")
            
        except AssertionError as e:
            print(f"\n❌ Test failed: {e}")
            raise
            
    except Exception as e:
        print(f"\n❌ Error during test setup: {e}")
        raise
        
    finally:
        # Clean up test database
        cleanup_test_database()
        print("\nTest database cleaned up")
