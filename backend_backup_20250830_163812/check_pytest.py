"""Check if pytest is working."""
import subprocess
import sys

def check_pytest():
    """Check if pytest is working."""
    try:
        # Check if pytest is installed
        import pytest
        print(f"pytest version: {pytest.__version__}")
        
        # Run a simple test
        result = subprocess.run(
            [sys.executable, "-m", "pytest", "--version"],
            capture_output=True,
            text=True,
            check=True
        )
        print("pytest is working!")
        print(result.stdout)
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    check_pytest()
