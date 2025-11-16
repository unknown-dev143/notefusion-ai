import requests
import json

def test_root():
    try:
        print("Testing root endpoint...")
        response = requests.get("http://localhost:8000/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return True
    except Exception as e:
        print(f"Error testing root endpoint: {e}")
        return False

def test_register():
    """Test the registration endpoint."""
    print("\nTesting registration endpoint...")
    try:
        # Test data
        test_data = {
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
        
        print("Sending request to:", "http://localhost:8000/api/v1/auth/register")
        print("Request data:", json.dumps(test_data, indent=2))
        
        # Make the request with timeout and detailed error handling
        try:
            response = requests.post(
                "http://localhost:8000/api/v1/auth/register",
                json=test_data,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                timeout=10  # 10 second timeout
            )
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response status: {e.response.status_code}")
                print(f"Response text: {e.response.text}")
            return False
        
        # Print response details
        print(f"\nResponse Status: {response.status_code}")
        print("Response Headers:")
        for header, value in response.headers.items():
            print(f"  {header}: {value}")
        
        # Try to parse and print response body
        try:
            response_data = response.json()
            print("Response Body:", json.dumps(response_data, indent=2))
        except ValueError:
            print("Response Body (raw):", response.text)
        
        # Check for success status
        if response.status_code == 200:
            print("✅ Registration successful!")
            return True
        else:
            print(f"❌ Registration failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Unexpected error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return False

if __name__ == "__main__":
    print("Starting API tests...")
    
    # Test root endpoint
    if not test_root():
        print("Root endpoint test failed. Server might not be running or accessible.")
    
    # Test registration
    if not test_register():
        print("Registration test failed. Check server logs for details.")
    
    print("\nTests completed.")
