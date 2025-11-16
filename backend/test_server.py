import sys
import requests
import json

def test_server():
    print("Testing server connection...")
    try:
        # Try to connect to the root endpoint
        response = requests.get("http://localhost:8000/", timeout=5)
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to server: {e}")
        return False
    return True

if __name__ == "__main__":
    if test_server():
        print("✅ Server is running and accessible")
    else:
        print("❌ Could not connect to the server")
