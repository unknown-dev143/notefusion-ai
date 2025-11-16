"""
Simple script to check if the FastAPI application is running and responding.
"""
import requests
import time
import webbrowser

def test_app():
    base_url = "http://localhost:8000"
    endpoints = [
        "/",
        "/docs",
        "/redoc",
        "/api/v1/health"
    ]
    
    print("🔍 Testing FastAPI application...")
    
    # Try to connect to the app with retries
    max_retries = 5
    for attempt in range(max_retries):
        try:
            # Test the root endpoint
            response = requests.get(base_url, timeout=5)
            if response.status_code == 200:
                print(f"✅ Application is running at {base_url}")
                break
                
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                print(f"❌ Failed to connect to the application: {str(e)}")
                print("\nPlease make sure the application is running with:")
                print("  python -m uvicorn app.main:app --reload")
                return False
                
            print(f"⚠️  Waiting for application to start... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(2)
    
    # Test each endpoint
    for endpoint in endpoints:
        try:
            url = f"{base_url}{endpoint}"
            response = requests.get(url, timeout=5)
            status = "✅" if response.status_code < 400 else "⚠️ "
            print(f"{status} {endpoint} - {response.status_code}")
            
        except Exception as e:
            print(f"❌ {endpoint} - Error: {str(e)}")
    
    # Open the API documentation in the default browser
    try:
        webbrowser.open(f"{base_url}/docs")
        print("\n📚 Opened API documentation in your default browser")
    except Exception as e:
        print(f"\n📚 You can view the API documentation at: {base_url}/docs")
    
    return True

if __name__ == "__main__":
    test_app()
    input("\nPress Enter to exit...")
