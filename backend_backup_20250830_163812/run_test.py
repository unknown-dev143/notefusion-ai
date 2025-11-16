"""Simple test runner script."""
import sys
import pytest

def main():
    print("Starting test runner...")
    print(f"Python version: {sys.version}")
    print(f"pytest version: {pytest.__version__}")
    
    # Run the simple test
    print("\nRunning simple test...")
    result = pytest.main(["-xvs", "tests/test_simple.py"])
    print(f"\nTest result: {result}")

if __name__ == "__main__":
    main()
