import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
API_KEY = os.getenv("API_KEY")

def print_response(response, success_codes=None):
    """Print response details in a readable format."""
    if success_codes is None:
        success_codes = [200, 201, 202, 204]
    
    status = "✅" if response.status_code in success_codes else "❌"
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

def test_public_endpoints():
    """Test endpoints that don't require authentication."""
    print("\n🔍 Testing public endpoints:")
    
    # Test health check
    response = requests.get(f"{BASE_URL}/health")
    print_response(response)

def test_protected_endpoints():
    """Test endpoints that require API key authentication."""
    if not API_KEY:
        print("\n⚠️  No API key found. Skipping protected endpoints.")
        return
    
    headers = {"X-API-Key": API_KEY}
    
    print(f"\n🔑 Testing protected endpoints with API key: {API_KEY[:10]}...")
    
    # Test getting notes
    response = requests.get(f"{BASE_URL}/notes/", headers=headers)
    print_response(response)
    
    # Test creating a note
    note_data = {"title": "Test Note", "content": "This is a test note"}
    response = requests.post(f"{BASE_URL}/notes/", json=note_data, headers=headers)
    print_response(response, success_codes=[200, 201])
    
    # If note was created, get its ID for further testing
    note_id = None
    try:
        if response.status_code in [200, 201]:
            note_id = response.json().get("id")
    except:
        pass
    
    # Test getting a specific note if we have an ID
    if note_id:
        response = requests.get(f"{BASE_URL}/notes/{note_id}", headers=headers)
        print_response(response)

def main():
    print("🚀 Starting API Endpoint Tests")
    print("=" * 60)
    
    test_public_endpoints()
    test_protected_endpoints()
    
    print("\n✅ All tests completed")

if __name__ == "__main__":
    main()
