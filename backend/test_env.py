import sys
import subprocess

def check_python_version():
    print(f"Python version: {sys.version}")
    if sys.version_info < (3, 7):
        print("Error: Python 3.7 or higher is required")
        return False
    return True

def check_package(package_name):
    try:
        __import__(package_name)
        print(f"✅ {package_name} is installed")
        return True
    except ImportError:
        print(f"❌ {package_name} is NOT installed")
        return False

def run_fastapi_test():
    print("\nTesting FastAPI...")
    test_app = """
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Test successful! FastAPI is working."}

if __name__ == "__main__":
    print("Starting test server on http://127.0.0.1:5000")
    uvicorn.run("__main__:app", host="0.0.0.0", port=5000, log_level="info")
"""
    with open("test_fastapi.py", "w") as f:
        f.write(test_app)
    
    print("Starting test server...")
    process = subprocess.Popen(
        [sys.executable, "test_fastapi.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    try:
        print("Test server started. Press Ctrl+C to stop.")
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        print("\nTest server is running. Please open http://127.0.0.1:5000 in your browser.")
        print("Press Enter to stop the server...")
        input()
    finally:
        process.terminate()
        print("Test server stopped.")

if __name__ == "__main__":
    print("Checking environment...")
    if check_python_version():
        check_package("fastapi")
        check_package("uvicorn")
        run_fastapi_test()
