import sys
import os

def main():
    print("===== Python Environment Check =====")
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Current Directory: {os.getcwd()}")
    
    print("\n===== Environment Variables =====")
    for key in ['PATH', 'PYTHONPATH', 'PYTHONHOME']:
        print(f"{key}: {os.environ.get(key, 'Not set')}")
    
    print("\n===== Python Path =====")
    for path in sys.path:
        print(path)
    
    print("\n===== Test Complete =====")

if __name__ == "__main__":
    main()
