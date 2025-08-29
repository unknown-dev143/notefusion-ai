import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API endpoint
BASE_URL = "http://localhost:8000/api/v1"
LOGIN_URL = f"{BASE_URL}/auth/login"

# Test user credentials (update these if different in your system)
TEST_USER = {
    "username": "testuser@example.com",
    "password": "testpassword123"
}

def get_auth_token():
    try:
        # Try to log in with test user
        response = requests.post(LOGIN_URL, json=TEST_USER)
        response.raise_for_status()
        
        token = response.json().get("access_token")
        if token:
            print(f"Auth Token: {token}")
            return token
        
    except requests.exceptions.RequestException as e:
        print(f"Error getting token: {e}")
        print("Response:", e.response.text if hasattr(e, 'response') else 'No response')

if __name__ == "__main__":
    token = get_auth_token()
    if token:
        print("\nUse this token in your .env file or test script:")
        print(f"AUTH_TOKEN={token}")
    else:
        print("\nFailed to get token. Creating a test user...")
        # Try to create a test user if login fails
        try:
            from create_test_user import create_test_user
            create_test_user()
            print("Test user created. Please run this script again to get the token.")
        except Exception as e:
            print(f"Error creating test user: {e}")
            print("\nPlease check your backend is running and accessible at http://localhost:8000")
            print("You may need to create a user manually through your frontend or API.")
