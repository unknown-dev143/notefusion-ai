import requests

def get_token():
    url = "http://localhost:8000/api/v1/auth/login"
    data = {
        "username": "testuser@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        token = response.json().get("access_token")
        if token:
            print(f"Your auth token is: {token}")
            return token
    except Exception as e:
        print(f"Error getting token: {e}")
        print("Make sure the backend is running and the test user exists.")
        print("Response status code:", getattr(response, 'status_code', 'No response'))
        print("Response content:", getattr(response, 'text', 'No content'))

if __name__ == "__main__":
    get_token()
