import requests
import time

# Wait for server to start
print("Waiting for server to be ready...")
time.sleep(5)

# Test user credentials
TEST_USER = {
    "username": "testuser@example.com",
    "password": "testpassword123"
}

# Base URL
BASE_URL = "http://localhost:8000/api/v1"

def get_auth_token():
    """Get authentication token"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data={"username": TEST_USER["username"], "password": TEST_USER["password"]}
        )
        response.raise_for_status()
        return response.json().get("access_token")
    except Exception as e:
        print(f"Error getting token: {e}")
        return None

def test_openai_endpoint(token):
    """Test the OpenAI endpoint"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "prompt": "Write a haiku about AI",
        "max_tokens": 100,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/ai/generate",
            json=data,
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error testing OpenAI endpoint: {e}")
        if hasattr(e, 'response'):
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        return None

if __name__ == "__main__":
    print("Starting test...")
    
    # Get auth token
    print("\n1. Getting authentication token...")
    token = get_auth_token()
    if not token:
        print("Failed to get authentication token. Please make sure the server is running and the test user exists.")
        exit(1)
    print("✓ Got authentication token")
    
    # Test OpenAI endpoint
    print("\n2. Testing OpenAI endpoint...")
    result = test_openai_endpoint(token)
    if result:
        print("✓ OpenAI endpoint test successful!")
        print("\nResponse:", result)
    else:
        print("✗ OpenAI endpoint test failed")
