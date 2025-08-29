import requests
import sys

def test_audio_summary():
    """Test the audio summary endpoint."""
    base_url = "http://localhost:8000/api/v1"
    
    # First, let's try to get a token (assuming we have a test user)
    try:
        # Try to login
        login_data = {
            "username": "test@example.com",
            "password": "testpassword"
        }
        
        # Try to login
        response = requests.post(f"{base_url}/auth/login/access-token", data=login_data)
        response.raise_for_status()
        token = response.json()["access_token"]
        
        print("✅ Successfully obtained access token")
        
        # Now test the summary endpoint
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Test with a note that should exist (ID 1)
        print("\nTesting summary endpoint...")
        response = requests.get(
            f"{base_url}/audio/notes/1/summarize?style=concise&max_length=250",
            headers=headers
        )
        
        if response.status_code == 200:
            print("✅ Summary test successful!")
            print("\nSummary response:")
            print(response.json())
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error making request: {str(e)}")
        print("\nMake sure the FastAPI server is running with:")
        print("1. Activate virtual environment: .\\.venv\\Scripts\\activate")
        print("2. Start server: uvicorn app.main:app --reload")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(test_audio_summary())
