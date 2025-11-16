import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_register():
    """Test user registration"""
    import random
    import string
    
    # Generate a random email for testing
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    test_email = f"test_{random_str}@example.com"
    
    url = f"{BASE_URL}/auth/register"
    user_data = {
        "email": test_email,
        "password": "testpass123",
        "full_name": "Test User"
    }
    
    print("Testing registration...")
    response = requests.post(url, json=user_data)
    
    if response.status_code == 200:
        print("✅ Registration successful!")
        print("User created:", response.json())
        return response.json()
    else:
        print("❌ Registration failed!")
        print(f"Status code: {response.status_code}")
        print("Response:", response.text)
        return None

def test_login(email):
    """Test user login"""
    url = f"{BASE_URL}/token"
    login_data = {
        "username": email,
        "password": "testpass123"
    }
    
    print("\nTesting login...")
    response = requests.post(
        url,
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if response.status_code == 200:
        print("✅ Login successful!")
        tokens = response.json()
        print("Access token:", tokens["access_token"])
        return tokens["access_token"]
    else:
        print("❌ Login failed!")
        print(f"Status code: {response.status_code}")
        print("Response:", response.text)
        return None

def test_protected_endpoint(token):
    """Test accessing a protected endpoint"""
    url = f"{BASE_URL}/api/v1/users/me"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("\nTesting protected endpoint...")
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        print("✅ Successfully accessed protected endpoint!")
        print("User data:", response.json())
    else:
        print("❌ Failed to access protected endpoint!")
        print(f"Status code: {response.status_code}")
        print("Response:", response.text)

if __name__ == "__main__":
    # Run tests
    user = test_register()
    if user:
        token = test_login(user['email'])
        if token:
            test_protected_endpoint(token)
