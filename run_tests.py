import sys
import subprocess

def run_tests():
    print("Running tests with Python:", sys.executable)
    print("Python version:", sys.version)
    
    # Install required packages
    print("\nInstalling test dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pytest", "pytest-asyncio"])
    
    # Run tests with verbose output
    print("\nRunning tests...")
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "backend/test_audio_services.py", "-v"],
        capture_output=True,
        text=True
    )
    
    print("\nTest output:")
    print(result.stdout)
    
    if result.stderr:
        print("\nErrors:")
        print(result.stderr)
    
    print("\nExit code:", result.returncode)
    return result.returncode

if __name__ == "__main__":
    sys.exit(run_tests())
