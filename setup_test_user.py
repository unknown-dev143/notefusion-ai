import requests
import time

def create_test_user():
    try:
        # Create test user
        response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json={
                "email": "testuser@example.com",
                "password": "testpassword123",
                "full_name": "Test User"
            }
        )
        
        if response.status_code == 200:
            print("Test user created successfully!")
            return True
        else:
            print(f"Failed to create test user: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error creating test user: {e}")
        return False

def get_auth_token():
    try:
        # Get auth token
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            data={
                "username": "testuser@example.com",
                "password": "testpassword123"
            }
        )
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            print("\nYour AUTH_TOKEN is:")
            print(token)
            print("\nAdd this to your .env file or test script.")
            return token
        else:
            print(f"Failed to get token: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error getting token: {e}")
        return None

if __name__ == "__main__":
    print("Setting up test user...")
    if create_test_user() or True:  # Always try to get token even if user exists
        print("\nGetting auth token...")
        token = get_auth_token()
        if token:
            # Test the OpenAI endpoint
            print("\nTesting OpenAI endpoint...")
            response = requests.post(
                "http://localhost:8000/api/v1/ai/generate",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "prompt": "Write a short test message",
                    "max_tokens": 50,
                    "temperature": 0.7
                }
            )
            print("\nOpenAI response:", response.status_code, response.text)
