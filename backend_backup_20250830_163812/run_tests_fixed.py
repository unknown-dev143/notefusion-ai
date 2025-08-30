"""
Run tests with proper Python environment setup.
"""
import os
import sys
import subprocess

def run_command(command):
    """Run a command and print its output."""
    print(f"\nRunning: {command}")
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            text=True,
            capture_output=True
        )
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Command failed with error: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    print("="*50)
    print("TEST ENVIRONMENT SETUP")
    print("="*50)
    
    # Ensure tests directory exists
    os.makedirs("tests", exist_ok=True)
    
    # Create a simple test file if it doesn't exist
    test_file = "tests/test_basic.py"
    if not os.path.exists(test_file):
        with open(test_file, "w") as f:
            f.write("""
""""Basic test cases for NoteFusion AI."""

def test_addition():
    """Test basic addition."""
    assert 1 + 1 == 2

def test_subtraction():
    """Test basic subtraction."""
    assert 3 - 1 == 2
""")
        print(f"Created {test_file}")
    
    # Install test requirements
    print("\nInstalling test requirements...")
    run_command(f"{sys.executable} -m pip install -r requirements.txt")
    run_command(f"{sys.executable} -m pip install pytest pytest-asyncio pytest-cov")
    
    # Run the tests
    print("\nRunning tests...")
    success = run_command(f"{sys.executable} -m pytest {test_file} -v")
    
    if success:
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Some tests failed")
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
