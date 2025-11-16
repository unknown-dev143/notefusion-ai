import requests
import json

# Create a test user
def create_test_user():
    url = "http://localhost:8000/api/v1/auth/register"
    user_data = {
        "email": "testuser@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    
    try:
        response = requests.post(url, json=user_data)
        if response.status_code == 200:
            print("Test user created successfully!")
            print("Email: testuser@example.com")
            print("Password: testpassword123")
            return True
        else:
            print(f"Failed to create user. Status code: {response.status_code}")
            print("Response:", response.text)
    except Exception as e:
        print(f"Error creating test user: {e}")
    return False

# Get auth token
def get_auth_token():
    url = "http://localhost:8000/api/v1/auth/login"
    login_data = {
        "username": "testuser@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(url, data=login_data)
        if response.status_code == 200:
            token = response.json().get("access_token")
            print(f"\nAUTH_TOKEN={token}")
            print("\nAdd this to your .env file or use it in your test script.")
            return token
        else:
            print(f"Login failed. Status code: {response.status_code}")
            print("Response:", response.text)
    except Exception as e:
        print(f"Error getting token: {e}")
    return None

if __name__ == "__main__":
    print("Attempting to create test user...")
    if create_test_user():
        print("\nGetting auth token...")
        get_auth_token()
    else:
        print("\nTrying to get token with existing user...")
        get_auth_token()
