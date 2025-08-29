import sys
import os

def main():
    print("Python Environment Test")
    print("======================")
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {sys.version}")
    print(f"Current Directory: {os.getcwd()}")
    print("\nEnvironment Variables:")
    for key in os.environ:
        if 'PYTHON' in key.upper():
            print(f"{key}: {os.environ[key]}")
    
    # Test file I/O
    try:
        with open('test_file.txt', 'w') as f:
            f.write('Test successful!')
        print("\nFile I/O test: Successfully wrote to test_file.txt")
        os.remove('test_file.txt')
    except Exception as e:
        print(f"\nFile I/O test failed: {e}")
    
    # Test imports
    print("\nTesting imports...")
    try:
        import fastapi
        print(f"FastAPI version: {fastapi.__version__}")
    except ImportError as e:
        print(f"FastAPI import failed: {e}")
    
    try:
        import uvicorn
        print(f"Uvicorn version: {uvicorn.__version__}")
    except ImportError as e:
        print(f"Uvicorn import failed: {e}")
    
    print("\nTest complete!")
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()
