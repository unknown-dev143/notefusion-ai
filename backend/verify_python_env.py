"""
Simple Python environment verification script.
Run this to check if Python is working correctly.
"""
import sys
import os

def main():
    print("="*50)
    print("PYTHON ENVIRONMENT CHECK")
    print("="*50)
    
    # Basic Python info
    print("\nPython Information:")
    print(f"Executable: {sys.executable}")
    print(f"Version: {sys.version}")
    print(f"Platform: {sys.platform}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Check if we can write to the directory
    try:
        test_file = "test_write.tmp"
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        print("\n✅ Can write to current directory")
    except Exception as e:
        print(f"\n❌ Cannot write to current directory: {e}")
    
    # Simple test
    print("\nRunning a simple test...")
    try:
        assert 1 + 1 == 2, "Basic math test failed"
        print("✅ Basic test passed!")
    except Exception as e:
        print(f"❌ Basic test failed: {e}")
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
