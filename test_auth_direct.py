import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_api_key_auth():
    """Test API key authentication with the server"""
    base_url = "http://localhost:8000/api/v1"
    
    # 1. Test public endpoint (should work without auth)
    print("\n🔍 Testing public endpoint:")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("   Is the server running? Start it with: uvicorn app.main:app --reload --port 8000")
        return
    
    # 2. Test protected endpoint without API key (should fail)
    print("\n🔒 Testing protected endpoint without API key:")
    try:
        response = requests.get(f"{base_url}/notes/")
        print(f"Status: {response.status_code} (should be 401 or 403)")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    # 3. Test with a test API key
    test_api_key = "test_key_123"  # This is just for testing
    print(f"\n🔑 Testing with test API key: {test_api_key}")
    try:
        headers = {"X-API-Key": test_api_key}
        response = requests.get(f"{base_url}/notes/", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n✅ Test completed!")
    print("\nIf you see 401/403 errors, the authentication is working as expected.")
    print("To use the API, you'll need to:")
    print("1. Start the server: uvicorn app.main:app --reload --port 8000")
    print("2. Generate a valid API key using the admin interface")
    print("3. Use the API key in the X-API-Key header")

if __name__ == "__main__":
    print("🚀 Testing API Key Authentication")
    print("=" * 50)
    test_api_key_auth()
