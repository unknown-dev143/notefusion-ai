import requests
import json
import sys

# Base URL of the API
BASE_URL = "http://localhost:8000/api/v1/auth"

def print_response(response, description):
    """Print the response in a formatted way."""
    print(f"\n=== {description} ===")
    print(f"Status Code: {response.status_code}")
    try:
        print("Response:", json.dumps(response.json(), indent=2))
    except:
        print("Response:", response.text)

def test_authentication():
    # Test data
    test_user = {
        "email": "test@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    }
    
    # 1. Test registration
    print("\n1. Testing user registration...")
    register_url = f"{BASE_URL}/register"
    register_data = {
        "email": test_user["email"],
        "password": test_user["password"],
        "full_name": test_user["full_name"]
    }
    try:
        register_response = requests.post(register_url, json=register_data)
        print_response(register_response, "Registration Response")
    except requests.exceptions.RequestException as e:
        print(f"Error during registration: {e}")
        sys.exit(1)
    
    if register_response.status_code != 200:
        print("\nRegistration failed. Trying to login instead...")
    else:
        print("\nRegistration successful!")
    
    # 2. Test login
    print("\n2. Testing user login...")
    login_url = f"{BASE_URL}/token"
    login_data = {
        "username": test_user["email"],
        "password": test_user["password"],
        "grant_type": "password"
    }
    try:
        login_response = requests.post(login_url, data=login_data)
        print_response(login_response, "Login Response")
        
        if login_response.status_code != 200:
            print("\nLogin failed. Cannot proceed with further tests.")
            return
        
        # Get access token
        access_token = login_response.json().get("access_token")
        if not access_token:
            print("\nNo access token in login response.")
            return
            
    except requests.exceptions.RequestException as e:
        print(f"Error during login: {e}")
        sys.exit(1)
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 3. Test getting current user
    print("\n3. Testing get current user...")
    me_url = f"{BASE_URL}/users/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        me_response = requests.get(me_url, headers=headers)
        print_response(me_response, "Current User Response")
    except requests.exceptions.RequestException as e:
        print(f"Error getting current user: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_authentication()
