import sys
import subprocess
import time
import requests
import json

def start_server():
    """Start the FastAPI server in a subprocess."""
    print("Starting FastAPI server...")
    server_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "start_server:app", "--reload", "--log-level", "debug"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Give the server some time to start
    time.sleep(5)
    return server_process

def test_root():
    """Test the root endpoint."""
    print("\nTesting root endpoint...")
    try:
        response = requests.get("http://localhost:8000/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing root endpoint: {e}")
        return False

def test_register():
    """Test the registration endpoint."""
    print("\nTesting registration endpoint...")
    try:
        data = {
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
        response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print("Response Headers:")
        for header, value in response.headers.items():
            print(f"  {header}: {value}")
            
        try:
            print("Response Body:", json.dumps(response.json(), indent=2))
        except ValueError:
            print("Response Body (non-JSON):", response.text)
            
        return response.status_code == 200
    except Exception as e:
        print(f"Error during registration test: {e}")
        return False

def main():
    """Main function to run tests."""
    # Start the server
    server = start_server()
    
    try:
        # Run tests
        print("\n" + "="*50)
        print("RUNNING TESTS")
        print("="*50)
        
        if not test_root():
            print("\n❌ Root endpoint test failed.")
        else:
            print("\n✅ Root endpoint test passed.")
            
        if not test_register():
            print("\n❌ Registration test failed.")
        else:
            print("\n✅ Registration test passed.")
            
    finally:
        # Ensure server is stopped
        print("\nStopping server...")
        server.terminate()
        
        # Print server output
        stdout, stderr = server.communicate()
        print("\nServer stdout:")
        print(stdout)
        print("\nServer stderr:")
        print(stderr)

if __name__ == "__main__":
    main()
