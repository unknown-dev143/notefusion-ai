import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
API_KEY = os.getenv("API_KEY")

def test_endpoint(method, path, requires_auth=True, **kwargs):
    url = f"{BASE_URL}{path}"
    headers = {}
    
    if requires_auth and API_KEY:
        headers["X-API-Key"] = API_KEY
    
    try:
        response = requests.request(method, url, headers=headers, **kwargs)
        
        # Print test result
        status = "✅" if 200 <= response.status_code < 300 else "❌"
        print(f"{status} {method} {path} - {response.status_code}")
        
        # Print rate limit headers if available
        for header in ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]:
            if header in response.headers:
                print(f"   {header}: {response.headers[header]}")
        
        # Print response data if available
        try:
            print(f"   Response: {response.json()}")
        except:
            if response.text:
                print(f"   Response: {response.text}")
        
        return response
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def main():
    print("🚀 Testing API Authentication Endpoints\n")
    
    # Test public health endpoint
    print("\n🔍 Testing public health endpoint:")
    test_endpoint("GET", "/health", requires_auth=False)
    
    if not API_KEY:
        print("\n⚠️  No API key found. Set API_KEY in .env file to test protected endpoints.")
        return
    
    # Test protected endpoints
    print(f"\n🔑 Testing with API key: {API_KEY[:10]}...")
    
    # Test getting notes (should require auth)
    print("\n📝 Testing notes endpoint:")
    test_endpoint("GET", "/notes/")
    
    # Test creating a note
    print("\n✏️  Testing note creation:")
    test_endpoint("POST", "/notes/", json={"title": "Test Note", "content": "This is a test note"})
    
    print("\n✅ All tests completed")

if __name__ == "__main__":
    main()
