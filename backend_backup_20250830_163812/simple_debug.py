"""
Simple Debug Script
------------------
A minimal script to test basic Python functionality and imports.
"""

def main():
    print("=== Simple Debug Script ===")
    print("Python is working!")
    
    # Test basic imports
    try:
        import sys
        import os
        print(f"Python version: {sys.version}")
        print(f"Working directory: {os.getcwd()}")
        print("✅ Basic imports successful")
    except Exception as e:
        print(f"❌ Import error: {e}")
    
    # Test file operations
    try:
        test_file = "test_file.txt"
        with open(test_file, "w") as f:
            f.write("Test successful!")
        os.remove(test_file)
        print("✅ File operations successful")
    except Exception as e:
        print(f"❌ File operation error: {e}")
    
    print("\nDebug script completed.")

if __name__ == "__main__":
    main()
