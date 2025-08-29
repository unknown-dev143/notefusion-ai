import requests
import sys

def check_server():
    try:
        response = requests.get("http://localhost:8000/api/v1/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def test_openai():
    if not check_server():
        print("Backend server is not running. Please start it with:")
        print("cd backend && uvicorn app.main:app --reload")
        return
        
    print("Testing OpenAI endpoint...")
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/ai/generate",
            json={
                "prompt": "Write a haiku about AI",
                "max_tokens": 100,
                "temperature": 0.7
            }
        )
        print(f"Status: {response.status_code}")
        print("Response:", response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_openai()
