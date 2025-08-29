"""
Verify the test environment and run a simple test.
"""
import sys
import os
import platform
import subprocess

def print_header(text):
    """Print a formatted header."""
    print("\n" + "=" * 50)
    print(f" {text} ")
    print("=" * 50)

def check_python():
    """Check Python version and environment."""
    print_header("PYTHON ENVIRONMENT")
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {platform.python_version()}")
    print(f"Working Directory: {os.getcwd()}")
    print(f"Virtual Environment: {hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)}")

def check_imports():
    """Check if required packages are installed."""
    print_header("REQUIRED PACKAGES")
    packages = [
        'pytest',
        'pytest-asyncio',
        'pytest-cov',
        'fastapi',
        'sqlalchemy',
        'pydantic',
        'aiosqlite'
    ]
    
    for pkg in packages:
        try:
            __import__(pkg)
            print(f"✓ {pkg}")
        except ImportError:
            print(f"✗ {pkg} (not installed)")

def run_simple_test():
    """Run a simple test to verify pytest is working."""
    print_header("RUNNING SIMPLE TEST")
    test_script = """
def test_addition():
    assert 1 + 1 == 2

def test_subtraction():
    assert 3 - 1 == 2
"""
    test_file = "temp_test_file.py"
    
    try:
        # Write the test file
        with open(test_file, "w") as f:
            f.write(test_script)
        
        # Run pytest
        print("Running pytest...")
        result = subprocess.run(
            [sys.executable, "-m", "pytest", test_file, "-v"],
            capture_output=True,
            text=True
        )
        
        # Print the output
        print("\nTest Output:")
        print(result.stdout)
        
        if result.returncode == 0:
            print("✅ Simple test passed!")
            return True
        else:
            print(f"❌ Test failed with return code {result.returncode}")
            print("Error output:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error running test: {e}")
        return False
    finally:
        # Clean up
        if os.path.exists(test_file):
            os.remove(test_file)

def main():
    """Main function to run all checks."""
    check_python()
    check_imports()
    
    print("\n" + "=" * 50)
    print(" VERIFICATION SUMMARY ")
    print("=" * 50)
    
    if run_simple_test():
        print("\n✅ Environment is ready for testing!")
        print("You can now run the task API tests with:")
        print("  python -m pytest tests/test_tasks_simple.py -v")
    else:
        print("\n❌ Environment verification failed.")
        print("Please check the output above for issues.")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
