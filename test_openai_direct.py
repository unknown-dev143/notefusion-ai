import requests
import subprocess
import time
import sys

def start_server():
    """Start the FastAPI server in a separate process"""
    try:
        print("Starting FastAPI server...")
        server = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--reload"],
            cwd="backend",
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
        time.sleep(5)  # Give server time to start
        return server
    except Exception as e:
        print(f"Error starting server: {e}")
        return None

def test_openai():
    """Test the OpenAI endpoint"""
    url = "http://localhost:8000/api/v1/ai/generate"
    
    # Test data
    data = {
        "prompt": "Write a haiku about artificial intelligence",
        "max_tokens": 100,
        "temperature": 0.7
    }
    
    try:
        print("Testing OpenAI endpoint...")
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print("Response:", response.json())
        return True
    except Exception as e:
        print(f"Error testing endpoint: {e}")
        return False

if __name__ == "__main__":
    server = start_server()
    if server:
        try:
            test_openai()
        finally:
            # Clean up
            server.terminate()
    else:
        print("Failed to start server")
