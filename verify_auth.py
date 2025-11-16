import requests
import json

def print_response(response):
    """Print response details"""
    print(f"Status: {response.status_code}")
    try:
        print("Response:", json.dumps(response.json(), indent=2))
    except:
        print("Response:", response.text)
    print("-" * 50)

def test_auth_flow():
    base_url = "http://localhost:8000/api/v1"
    
    print("🔍 Testing health check...")
    response = requests.get(f"{base_url}/health")
    print_response(response)
    
    print("🔑 Creating API key...")
    response = requests.post(f"{base_url}/auth/api-keys")
    print_response(response)
    
    if response.status_code == 200:
        api_key = response.json().get("key")
        print(f"✅ Got API key: {api_key}")
        
        headers = {"X-API-Key": api_key}
        
        print("\n📝 Testing note creation...")
        note_data = {"title": "Test Note", "content": "This is a test note"}
        response = requests.post(
            f"{base_url}/notes/", 
            json=note_data,
            headers=headers
        )
        print_response(response)
        
        print("📋 Listing notes...")
        response = requests.get(f"{base_url}/notes/", headers=headers)
        print_response(response)
    else:
        print("❌ Failed to get API key")

if __name__ == "__main__":
    print("🚀 Testing Authentication Flow\n")
    test_auth_flow()
