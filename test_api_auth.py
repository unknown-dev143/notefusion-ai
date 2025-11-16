import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
API_KEY = ""  # Add your API key here or set it in .env as API_KEY

# Test endpoints
endpoints = [
    {"method": "GET", "path": "/health", "requires_auth": False},
    {"method": "GET", "path": "/notes/", "requires_auth": True},
    {"method": "POST", "path": "/notes/", "requires_auth": True, "json": {"title": "Test Note", "content": "Test content"}},
]

def test_endpoint(method, path, requires_auth=True, **kwargs):
    url = f"{BASE_URL}{path}"
    headers = {}
    
    if requires_auth:
        if not API_KEY:
            print(f"❌ Skipping {method} {path} - No API key provided")
            return
        headers["X-API-Key"] = API_KEY
    
    try:
        response = requests.request(method, url, headers=headers, **kwargs)
        print(f"\n{'✅' if response.status_code < 400 else '❌'} {method} {path} - {response.status_code}")
        
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

if __name__ == "__main__":
    print("🚀 Testing API Authentication\n")
    
    # Get API key from environment if not set
    global API_KEY
    if not API_KEY:
        API_KEY = os.getenv("API_KEY")
    
    if not API_KEY:
        print("⚠️  No API key found. Set API_KEY in the script or in .env file.")
        print("   Some tests will be skipped.\n")
    
    for endpoint in endpoints:
        method = endpoint["method"]
        path = endpoint["path"]
        requires_auth = endpoint.get("requires_auth", True)
        
        # Skip auth-required endpoints if no API key
        if requires_auth and not API_KEY:
            print(f"⚠️  Skipping {method} {path} - API key required")
            continue
            
        # Prepare request data
        kwargs = {k: v for k, v in endpoint.items() if k in ["json", "data"]}
        
        # Test the endpoint
        test_endpoint(method, path, requires_auth, **kwargs)
    
    print("\n✅ Tests completed")
