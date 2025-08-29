import os
import sys
import platform
import subprocess

def print_header(title):
    print(f"\n{'='*50}")
    print(f"{title:^50}")
    print(f"{'='*50}")

def test_basic():
    print_header("Basic System Information")
    print(f"Python Version: {sys.version}")
    print(f"Operating System: {platform.system()} {platform.release()}")
    print(f"Current Directory: {os.getcwd()}")

def test_node():
    print_header("Node.js Test")
    try:
        # Check Node.js version
        node_version = subprocess.check_output(['node', '--version'], stderr=subprocess.STDOUT, text=True).strip()
        print(f"✅ Node.js version: {node_version}")
        
        # Run a simple JavaScript command
        result = subprocess.check_output(['node', '-e', 'console.log(1+1)'], text=True).strip()
        print(f"✅ Basic JavaScript execution: 1+1 = {result}")
        
    except Exception as e:
        print(f"❌ Node.js test failed: {str(e)}")

def test_file_system():
    print_header("File System Test")
    test_file = "test_python_file.txt"
    try:
        # Write to file
        with open(test_file, 'w') as f:
            f.write("Hello from Python!")
        print(f"✅ Successfully wrote to {test_file}")
        
        # Read from file
        with open(test_file, 'r') as f:
            content = f.read()
        print(f"✅ Successfully read from {test_file}")
        print(f"File content: {content}")
        
        # Clean up
        os.remove(test_file)
        print(f"✅ Successfully deleted {test_file}")
        
    except Exception as e:
        print(f"❌ File system test failed: {str(e)}")

if __name__ == "__main__":
    test_basic()
    test_node()
    test_file_system()
    print("\nTest completed!")
