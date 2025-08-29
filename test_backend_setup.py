import sys
import os
import subprocess
import time
import requests
from pathlib import Path

def check_python():
    print("\n🔍 Checking Python installation...")
    print(f"Python {sys.version}")
    print(f"Executable: {sys.executable}")

def check_dependencies():
    print("\n🔍 Checking dependencies...")
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import requests
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing package: {e.name}")
        print(f"Install it with: pip install {e.name}")
        return False

def start_backend():
    print("\n🚀 Starting backend server...")
    backend_dir = Path(__file__).parent / "backend"
    if not backend_dir.exists():
        print(f"❌ Backend directory not found at {backend_dir}")
        return None
    
    try:
        server = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"],
            cwd=str(backend_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait for server to start
        time.sleep(5)
        return server
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return None

def test_health_check():
    print("\n🏥 Testing health check...")
    try:
        response = requests.get("http://localhost:8000/api/v1/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_openai_endpoint():
    print("\n🤖 Testing OpenAI endpoint...")
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/ai/generate",
            json={
                "prompt": "Write a haiku about AI",
                "max_tokens": 100,
                "temperature": 0.7
            },
            timeout=10
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ OpenAI endpoint test failed: {e}")
        return False

def main():
    print("🔧 NoteFusion AI Backend Test Script")
    print("=" * 40)
    
    check_python()
    
    if not check_dependencies():
        print("\n❌ Please install the missing dependencies first.")
        return 1
    
    server = start_backend()
    if not server:
        return 1
    
    try:
        if test_health_check():
            test_openai_endpoint()
        else:
            print("\n❌ Health check failed. Check the server logs above for errors.")
            return 1
    finally:
        if server:
            print("\n🛑 Stopping server...")
            server.terminate()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
