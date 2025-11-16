import requests

# Test user credentials (update these if different)
TEST_USER = {
    "username": "testuser@example.com",
    "password": "testpassword123"
}

def get_token():
    try:
        # Try to log in
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            data={"username": TEST_USER["username"], "password": TEST_USER["password"]}
        )
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            print(f"Your AUTH_TOKEN is:")
            print(token)
            print("\nUse this in your .env file or test script.")
        else:
            print(f"Login failed with status {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure the backend server is running on port 8000")

if __name__ == "__main__":
    get_token()
