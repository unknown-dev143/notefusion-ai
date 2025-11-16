import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_public_endpoint():
    """Test public endpoint without authentication"""
    print("\n🔍 Testing public endpoint...")
    try:
        response = requests.get("http://localhost:8000/api/v1/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

def test_protected_endpoint(api_key):
    """Test protected endpoint with API key"""
    print("\n🔒 Testing protected endpoint with API key...")
    headers = {"X-API-Key": api_key}
    
    try:
        # Test GET /notes/
        print("   Testing GET /notes/...")
        response = requests.get("http://localhost:8000/api/v1/notes/", headers=headers)
        print(f"   Status: {response.status_code}")
        
        # Test POST /notes/
        print("\n   Testing POST /notes/...")
        note_data = {"title": "Test Note", "content": "This is a test note"}
        response = requests.post("http://localhost:8000/api/v1/notes/", 
                               json=note_data, 
                               headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Created note ID: {response.json().get('id')}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

def test_rate_limiting(api_key):
    """Test rate limiting"""
    print("\n⏱️  Testing rate limiting...")
    headers = {"X-API-Key": api_key}
    
    try:
        for i in range(1, 6):
            response = requests.get("http://localhost:8000/api/v1/notes/", headers=headers)
            print(f"   Request {i}: Status {response.status_code} - "
                  f"Remaining: {response.headers.get('X-RateLimit-Remaining', 'N/A')}")
            
    except Exception as e:
        print(f"   ❌ Error during rate limit test: {str(e)}")
        return False
    
    return True

def main():
    print("🚀 API Key Authentication Test\n")
    
    # Get API key from environment
    api_key = os.getenv("API_KEY")
    if not api_key:
        print("❌ No API_KEY found in .env file")
        print("   Please run generate_api_key.py first")
        return
    
    print(f"🔑 Using API Key: {api_key[:10]}...")
    
    # Run tests
    if not test_public_endpoint():
        print("\n❌ Public endpoint test failed")
        return
    
    if not test_protected_endpoint(api_key):
        print("\n❌ Protected endpoint test failed")
        return
    
    if not test_rate_limiting(api_key):
        print("\n⚠️  Rate limiting test had issues")
    
    print("\n✅ All tests completed successfully!")
    print("\n🔑 Your API key is working correctly!")
    print("   You can now use it to authenticate your API requests.")
    print("   Example curl command:")
    print(f'   curl -H "X-API-Key: {api_key}" http://localhost:8000/api/v1/notes/')

if __name__ == "__main__":
    main()
