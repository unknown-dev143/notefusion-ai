import requests
import sys

def check_server():
    try:
        # Test root endpoint
        print("Testing root endpoint (GET /)...")
        response = requests.get("http://localhost:8000/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Test health endpoint
        print("\nTesting health endpoint (GET /health)...")
        response = requests.get("http://localhost:8000/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Test OpenAPI docs
        print("\nTesting OpenAPI docs (GET /docs)...")
        response = requests.get("http://localhost:8000/docs")
        print(f"Status Code: {response.status_code}")
        
        # Test OpenAPI JSON
        print("\nTesting OpenAPI JSON (GET /openapi.json)...")
        response = requests.get("http://localhost:8000/openapi.json")
        print(f"Status Code: {response.status_code}")
        
    except requests.exceptions.ConnectionError as e:
        print(f"\n❌ Could not connect to the server: {e}")
        print("Please make sure the FastAPI server is running.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_server()
