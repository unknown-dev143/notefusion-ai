import sys
import os

def print_section(title):
    print("\n" + "="*50)
    print(f" {title} ")
    print("="*50)

# Basic Python info
print_section("PYTHON INFORMATION")
print(f"Python Executable: {sys.executable}")
print(f"Python Version: {sys.version}")
print(f"Working Directory: {os.getcwd()}")

# Path information
print_section("PYTHON PATH")
for i, path in enumerate(sys.path, 1):
    print(f"{i:2d}. {path}")

# Check if we can write to the directory
try:
    test_file = "test_write.tmp"
    with open(test_file, "w") as f:
        f.write("test")
    os.remove(test_file)
    print("\n✅ Can write to current directory")
except Exception as e:
    print(f"\n❌ Cannot write to current directory: {e}")

# Check basic imports
try:
    import pytest
    print(f"✅ pytest is installed: {pytest.__version__}")
except ImportError:
    print("❌ pytest is not installed")

try:
    import sqlalchemy
    print(f"✅ SQLAlchemy is installed: {sqlalchemy.__version__}")
except ImportError:
    print("❌ SQLAlchemy is not installed")

# Environment variables
print_section("ENVIRONMENT VARIABLES")
for key, value in os.environ.items():
    if "PYTHON" in key or "PATH" in key or "VIRTUAL" in key:
        print(f"{key} = {value}")
