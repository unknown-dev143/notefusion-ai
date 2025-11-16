import sys
import os
import json
from fastapi.testclient import TestClient

# Set environment variables for testing
os.environ["SECRET_KEY"] = "test-secret-key-1234567890"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"
os.environ["DATABASE_URL"] = "sqlite:///./notefusion.db"
os.environ["BACKEND_CORS_ORIGINS"] = json.dumps([])

# Import the FastAPI app after setting environment variables
from main import app

client = TestClient(app)

def test_register_and_login():
    # Test user data
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpass123"
    }
    
    print("1. Testing registration...")
    # Test registration
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200, f"Registration failed: {response.text}"
    print("   ✅ Registration successful")
    
    print("\n2. Testing login...")
    # Test login
    login_data = {
        "username": user_data["email"],
        "password": user_data["password"],
    }
    response = client.post(
        "/api/v1/auth/token",
        data={
            "username": user_data["email"],
            "password": user_data["password"],
            "grant_type": "password"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["access_token"]
    print(f"   ✅ Login successful. Token: {token[:30]}...")
    
    print("\n3. Testing protected route...")
    # Test protected route
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, f"Protected route failed: {response.text}"
    user_info = response.json()
    assert user_info["email"] == user_data["email"]
    print(f"   ✅ Protected route successful. User: {user_info}")
    
    print("\n✅ All tests passed!")

if __name__ == "__main__":
    print("=== Starting Authentication Endpoint Test ===\n")
    test_register_and_login()
