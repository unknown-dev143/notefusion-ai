import sys
import os

def test_environment():
    print("=== Python Environment Test ===")
    print(f"Python Version: {sys.version}")
    print(f"Current Working Directory: {os.getcwd()}")
    print("\nEnvironment Variables:")
    for key, value in os.environ.items():
        if 'python' in key.lower() or 'path' in key.lower():
            print(f"{key}: {value}")

if __name__ == "__main__":
    test_environment()
