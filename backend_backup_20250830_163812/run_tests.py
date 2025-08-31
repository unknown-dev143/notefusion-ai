"""Test runner for the application."""
import os
import sys
import pytest

def run_tests():
    """Run all tests and return the exit code."""
    # Set environment variables for testing
    os.environ["TESTING"] = "true"
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    
    # Run pytest with coverage and other options
    return pytest.main([
        "-v",
        "--tb=short",
        "--cov=app",
        "--cov-report=term-missing",
        "--cov-report=xml:coverage.xml",
        "tests/"
    ])

if __name__ == "__main__":
    sys.exit(run_tests())
