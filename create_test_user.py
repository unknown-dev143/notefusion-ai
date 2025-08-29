import sys
import requests

def create_test_user():
    """Create a test user if one doesn't exist."""
    base_url = "http://localhost:8000/api/v1"
    
    test_user = {
        "email": "test@example.com",
        "password": "testpassword",
        "full_name": "Test User"
    }
    
    try:
        # Try to register the test user
        response = requests.post(
            f"{base_url}/auth/register",
            json=test_user
        )
        
        if response.status_code == 200:
            print("✅ Test user created successfully!")
            print(f"Email: {test_user['email']}")
            print(f"Password: {test_user['password']}")
        elif response.status_code == 400 and "already exists" in response.text.lower():
            print("ℹ️ Test user already exists")
        else:
            print(f"❌ Error creating test user: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error: Could not connect to the server. Make sure it's running.")
        print("Start the server with:\n")
        print("1. cd backend")
        print("2. uvicorn app.main:app --reload")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(create_test_user())
