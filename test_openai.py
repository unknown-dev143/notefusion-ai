import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the base URL from environment or use default
BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

# Test the OpenAI endpoint
def test_openai_endpoint():
    url = f"{BASE_URL}/api/v1/ai/generate"
    headers = {
        "Authorization": f"Bearer {os.getenv('TEST_ACCESS_TOKEN')}",  # Make sure to set this in your .env
        "Content-Type": "application/json"
    }
    
    data = {
        "prompt": "Write a short poem about artificial intelligence",
        "max_tokens": 100,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        print("Response:", response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print("Response content:", e.response.text)

if __name__ == "__main__":
    test_openai_endpoint()
