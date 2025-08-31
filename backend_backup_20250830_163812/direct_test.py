import sys
import os
import subprocess

def run_command(command, cwd=None):
    """Run a command and return the output and return code."""
    print(f"\nRunning: {command}")
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=True
        )
        print(f"✅ Command succeeded with return code {result.returncode}")
        print(f"Output:\n{result.stdout}")
        if result.stderr:
            print(f"Error output:\n{result.stderr}")
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed with return code {e.returncode}")
        print(f"Output:\n{e.stdout}")
        print(f"Error output:\n{e.stderr}")
        return False

def main():
    print("="*50)
    print("DIRECT PYTHON ENVIRONMENT CHECK")
    print("="*50)
    
    # Check Python version
    print("\nPython Environment:")
    print(f"Executable: {sys.executable}")
    print(f"Version: {sys.version}")
    
    # Check if we can import required packages
    print("\nChecking package imports:")
    packages = ['pytest', 'fastapi', 'sqlalchemy', 'pydantic']
    for pkg in packages:
        try:
            __import__(pkg)
            print(f"✅ {pkg} is importable")
        except ImportError as e:
            print(f"❌ {pkg} import failed: {e}")
    
    # Run a simple Python test
    print("\nRunning a simple Python test:")
    test_code = """
def test_addition():
    assert 1 + 1 == 2

if __name__ == "__main__":
    test_addition()
    print("✅ Simple test passed!")
"""
    test_file = "temp_simple_test.py"
    try:
        with open(test_file, "w") as f:
            f.write(test_code)
        
        print(f"\nRunning {test_file}:")
        success = run_command(f"{sys.executable} {test_file}")
        
        if success:
            print("\n✅ Python environment is working correctly!")
            
            # Now try running pytest directly
            print("\n" + "="*50)
            print("RUNNING PYTEST DIRECTLY")
            print("="*50)
            
            # Create a simple pytest file if it doesn't exist
            if not os.path.exists("tests/test_basic.py"):
                os.makedirs("tests", exist_ok=True)
                with open("tests/test_basic.py", "w") as f:
                    f.write("""
def test_addition():
    assert 1 + 1 == 2

def test_subtraction():
    assert 3 - 1 == 2
""")
            
            # Run pytest
            pytest_cmd = f"{sys.executable} -m pytest tests/test_basic.py -v"
            print(f"\nRunning: {pytest_cmd}")
            run_command(pytest_cmd)
            
    finally:
        # Clean up
        if os.path.exists(test_file):
            os.remove(test_file)

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
