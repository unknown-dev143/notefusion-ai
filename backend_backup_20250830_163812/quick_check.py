import sys
import os

def print_header(text):
    print("\n" + "="*50)
    print(f" {text} ")
    print("="*50)

print_header("PYTHON ENVIRONMENT CHECK")
print(f"Python Executable: {sys.executable}")
print(f"Python Version: {sys.version}")
print(f"Working Directory: {os.getcwd()}")
print(f"Virtual Environment: {hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)}")

# Check package imports
print_header("PACKAGE CHECKS")
packages = [
    'pytest',
    'fastapi',
    'sqlalchemy',
    'pydantic',
    'aiosqlite'
]

for pkg in packages:
    try:
        __import__(pkg)
        print(f"✅ {pkg} is importable")
    except ImportError as e:
        print(f"❌ {pkg} import failed: {e}")

# Run a simple test
print_header("RUNNING BASIC TEST")
try:
    assert 1 + 1 == 2, "Basic math test failed"
    print("✅ Basic test passed!")
    
    # Create a simple test file if it doesn't exist
    os.makedirs("tests", exist_ok=True)
    test_file = "tests/test_basic.py"
    if not os.path.exists(test_file):
        with open(test_file, "w") as f:
            f.write("""
def test_addition():
    assert 1 + 1 == 2

def test_subtraction():
    assert 3 - 1 == 2
""")
        print("✅ Created test_basic.py")
    
    # Run pytest
    print("\nRunning pytest...")
    import pytest
    sys.exit(pytest.main(["-v", test_file]))
    
except AssertionError as e:
    print(f"❌ Test failed: {e}")
    input("\nPress Enter to exit...")
