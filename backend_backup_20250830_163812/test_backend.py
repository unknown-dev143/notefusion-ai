import sys
import asyncio
from fastapi.testclient import TestClient

# Add the project root to the Python path
sys.path.append('.')

# Import the FastAPI app
try:
    from app.main import app
    print("✅ Successfully imported FastAPI app")
except Exception as e:
    print(f"❌ Error importing FastAPI app: {e}")
    sys.exit(1)

# Create a test client
client = TestClient(app)

# Test endpoints
try:
    # Test root endpoint
    print("\nTesting root endpoint...")
    response = client.get("/")
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.json()}")

except Exception as e:
    print(f"❌ Error during test: {e}")

print("\n✅ Test completed")
