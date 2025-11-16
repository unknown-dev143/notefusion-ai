"""
Simple test runner to verify the environment and run basic tests.
"""
import sys
import os

def main():
    print("="*50)
    print("SIMPLE TEST RUNNER")
    print("="*50)
    
    # Basic environment info
    print("\nPython Environment:")
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {sys.version}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Simple test
    print("\nRunning a simple test...")
    try:
        assert 1 + 1 == 2, "Basic math test failed"
        print("✅ Basic test passed!")
    except Exception as e:
        print(f"❌ Basic test failed: {e}")
    
    # Check if we can create a test file
    print("\nTesting file operations...")
    test_file = "test_file.tmp"
    try:
        with open(test_file, "w") as f:
            f.write("test")
        print("✅ Can write to current directory")
        os.remove(test_file)
    except Exception as e:
        print(f"❌ File operation failed: {e}")
    
    # Try to import pytest
    print("\nChecking pytest...")
    try:
        import pytest
        print(f"✅ pytest is installed: {pytest.__version__}")
    except ImportError as e:
        print(f"❌ pytest is not installed: {e}")
    
    # Run a simple pytest
    print("\nRunning a simple pytest...")
    test_script = """
def test_addition():
    assert 1 + 1 == 2

def test_subtraction():
    assert 3 - 1 == 2
"""
    test_file = "test_simple.py"
    try:
        with open(test_file, "w") as f:
            f.write(test_script)
        
        import subprocess
        result = subprocess.run(
            [sys.executable, "-m", "pytest", test_file, "-v"],
            capture_output=True,
            text=True
        )
        
        print("\nTest Output:")
        print(result.stdout)
        
        if result.returncode == 0:
            print("✅ All tests passed!")
        else:
            print(f"❌ Tests failed with return code {result.returncode}")
            print("Error output:")
            print(result.stderr)
            
    except Exception as e:
        print(f"❌ Error running tests: {e}")
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
