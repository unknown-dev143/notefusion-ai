import sys
import os
import platform
import subprocess

def print_section(title):
    print("\n" + "="*50)
    print(f"{title}".center(50))
    print("="*50)

try:
    # System Information
    print_section("SYSTEM INFORMATION")
    print(f"System: {platform.system()} {platform.release()} {platform.version()}")
    print(f"Processor: {platform.processor()}")
    print(f"Machine: {platform.machine()}")
    
    # Python Information
    print_section("PYTHON INFORMATION")
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {sys.version}")
    print(f"Python Path: {sys.path}")
    
    # Environment Variables
    print_section("ENVIRONMENT VARIABLES")
    python_vars = {k: v for k, v in os.environ.items() if 'python' in k.lower() or 'path' in k.lower()}
    for k, v in python_vars.items():
        print(f"{k}: {v}")
    
    # Test file operations
    print_section("FILE OPERATIONS TEST")
    test_file = "test_file.txt"
    with open(test_file, 'w') as f:
        f.write("Test successful!")
    print(f"Successfully wrote to {test_file}")
    os.remove(test_file)
    print(f"Successfully deleted {test_file}")
    
    # Test imports
    print_section("IMPORT TEST")
    try:
        import fastapi
        print(f"FastAPI version: {fastapi.__version__}")
    except ImportError:
        print("FastAPI not installed")
    
    try:
        import uvicorn
        print(f"Uvicorn version: {uvicorn.__version__}")
    except ImportError:
        print("Uvicorn not installed")
    
    print_section("TEST COMPLETE")
    input("Press Enter to exit...")
    
except Exception as e:
    print(f"\nERROR: {str(e)}")
    input("Press Enter to exit...")
