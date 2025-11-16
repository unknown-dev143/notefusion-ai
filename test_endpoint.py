import requests
import time

def test_endpoint():
    url = "http://localhost:5000/api/v1/health"
    max_retries = 5
    retry_delay = 2  # seconds
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=5)
            print(f"Response from {url}:")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            return True
        except requests.exceptions.RequestException as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
    return False

if __name__ == "__main__":
    print("Testing FastAPI endpoint...")
    success = test_endpoint()
    if not success:
        print("\nFailed to connect to the FastAPI server.")
        print("Please make sure the server is running on port 5000.")
        print("You can start it by running: python minimal_app.py")
