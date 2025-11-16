import sys
import os

def main():
    print("===== Python Environment Test =====")
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")
    print("\nEnvironment Variables:")
    for key in ['PATH', 'PYTHONPATH', 'PYTHONHOME']:
        print(f"{key}: {os.environ.get(key, 'Not set')}")
    print("\n===== Test Complete =====")

if __name__ == "__main__":
    main()
