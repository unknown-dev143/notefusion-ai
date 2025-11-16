"""Test FastAPI application setup."""
import sys
import os
from fastapi.testclient import TestClient

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath('.'))

try:
    from app.main import app
    from app.core.config import settings
    
    print("✅ Successfully imported FastAPI app")
    
    # Create test client
    client = TestClient(app)
    
    # Test root endpoint
    print("\nTesting root endpoint...")
    response = client.get("/")
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test API docs
    print("\nTesting API documentation...")
    response = client.get("/docs")
    print(f"Docs status code: {response.status_code}")
    
    print("\n✅ Basic tests completed successfully!")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
