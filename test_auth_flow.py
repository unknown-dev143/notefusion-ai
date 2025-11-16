import os
import sys
import asyncio
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
TEST_EMAIL = "testuser@example.com"
TEST_PASSWORD = "testpassword123"

def print_response(response):
    """Print response details in a readable format."""
    status = "✅" if 200 <= response.status_code < 400 else "❌"
    print(f"{status} {response.request.method} {response.url} - {response.status_code}")
    
    # Print rate limit headers if available
    for header in ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]:
        if header in response.headers:
            print(f"   {header}: {response.headers[header]}")
    
    # Print response data if available
    try:
        data = response.json()
        if data:
            print("   Response:", data)
    except:
        if response.text:
            print("   Response:", response.text)
    
    return response

async def test_auth_flow():
    print("🚀 Testing Authentication Flow\n")
    
    # 1. Test public health endpoint
    print("\n1. Testing public health endpoint:")
    response = requests.get(f"{BASE_URL}/health")
    print_response(response)
    
    # 2. Register a test user (if not exists)
    print("\n2. Registering test user:")
    user_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "full_name": "Test User"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    response = print_response(response)
    
    # 3. Login to get access token
    print("\n3. Logging in to get access token:")
    login_data = {
        "username": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    response = print_response(response)
    
    if response.status_code != 200:
        print("❌ Failed to login. Aborting test.")
        return
    
    access_token = response.json().get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 4. Create an API key
    print("\n4. Creating API key:")
    key_data = {
        "name": "Test API Key",
        "scopes": ["notes:read", "notes:write"],
        "rate_limit": 1000
    }
    response = requests.post(
        f"{BASE_URL}/auth/api-keys",
        json=key_data,
        headers=headers
    )
    response = print_response(response)
    
    if response.status_code != 200:
        print("❌ Failed to create API key. Aborting test.")
        return
    
    api_key = response.json().get("key")
    api_key_headers = {"X-API-Key": api_key}
    
    # 5. Test API key authentication
    print("\n5. Testing API key authentication:")
    
    # Test without API key (should fail)
    print("\n   Testing without API key (should fail):")
    response = requests.get(f"{BASE_URL}/notes/")
    print_response(response)
    
    # Test with API key (should succeed)
    print("\n   Testing with API key (should succeed):")
    response = requests.get(f"{BASE_URL}/notes/", headers=api_key_headers)
    print_response(response)
    
    # 6. Test rate limiting
    print("\n6. Testing rate limiting (first 3 requests):")
    for i in range(3):
        response = requests.get(f"{BASE_URL}/notes/", headers=api_key_headers)
        print(f"   Request {i+1}:")
        print_response(response)
    
    print("\n✅ Authentication flow test completed")

if __name__ == "__main__":
    asyncio.run(test_auth_flow())
