import uvicorn
import sys
import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Create a test FastAPI app
app = FastAPI()

# Simple test endpoint
@app.get("/test")
async def test_endpoint():
    return {"message": "Test endpoint is working!"}

# Create test client
client = TestClient(app)

def test_test_endpoint():
    response = client.get("/test")
    assert response.status_code == 200
    assert response.json() == {"message": "Test endpoint is working!"}

if __name__ == "__main__":
    print("=== Starting Test Server ===")
    try:
        # Run the test
        test_test_endpoint()
        print("✅ Test endpoint is working")
        
        # Start the test server
        print("\nStarting test server on http://127.0.0.1:8000/test")
        print("Press Ctrl+C to stop the server")
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
