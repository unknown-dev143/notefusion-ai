import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def login():
    """Login and get an access token"""
    url = "http://localhost:8000/api/v1/auth/login"
    data = {
        "username": "test@example.com",
        "password": "testpassword"
    }
    
    try:
        response = requests.post(url, data=data)
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            print(f"❌ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error during login: {str(e)}")
        return None

def create_api_key(access_token):
    """Create a new API key"""
    url = "http://localhost:8000/api/v1/auth/api-keys"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "name": "Test API Key",
        "scopes": ["notes:read", "notes:write", "users:read"],
        "rate_limit": 1000
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Failed to create API key: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error creating API key: {str(e)}")
        return None

def main():
    print("🔑 Generating API Key for test user...\n")
    
    # Step 1: Login to get access token
    print("1. Logging in as test user...")
    access_token = login()
    if not access_token:
        print("❌ Failed to login. Please check if the server is running and credentials are correct.")
        return
    
    print("✅ Login successful!")
    
    # Step 2: Create API key
    print("\n2. Creating API key...")
    api_key_info = create_api_key(access_token)
    if not api_key_info:
        return
    
    # Save API key to .env file
    with open(".env", "a") as f:
        f.write(f"\n# Test API Key\nAPI_KEY={api_key_info['key']}\n")
    
    print("\n✅ API Key generated and saved to .env file!")
    print("\n🔑 API Key Information:")
    print(f"   Key ID:     {api_key_info['key_id']}")
    print(f"   Key:        {api_key_info['key']}")
    print(f"   Name:       {api_key_info['name']}")
    print(f"   Scopes:     {', '.join(api_key_info['scopes'])}")
    print(f"   Rate Limit: {api_key_info['rate_limit']} requests/minute")
    print("\n⚠️  IMPORTANT: Keep this key secure and do not commit it to version control!")

if __name__ == "__main__":
    main()
