import requests
import sys

def test_authentication():
    # Replace with your test API key
    API_KEY = "test-api-key-123"
    
    # Test with valid API key
    print("Testing with valid API key...")
    try:
        response = requests.get(
            "http://localhost:8000/api/test",
            headers={"X-API-Key": API_KEY}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error with valid key: {e}")
    
    # Test with invalid API key
    print("\nTesting with invalid API key...")
    try:
        response = requests.get(
            "http://localhost:8000/api/test",
            headers={"X-API-Key": "invalid-key-123"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error with invalid key: {e}")
    
    # Test without API key
    print("\nTesting without API key...")
    try:
        response = requests.get("http://localhost:8000/api/test")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error without key: {e}")

if __name__ == "__main__":
    test_authentication()
