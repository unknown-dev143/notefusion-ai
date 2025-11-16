import sys
import os
import subprocess

def run_command(command):
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"Error: {e.stderr}"

def main():
    with open('python_env_test.txt', 'w') as f:
        # Test 1: Basic Python info
        f.write("=== Python Environment Test ===\n")
        f.write(f"Python Executable: {sys.executable}\n")
        f.write(f"Python Version: {sys.version}\n")
        f.write(f"Current Working Directory: {os.getcwd()}\n\n")
        
        # Test 2: Run a simple Python command
        f.write("=== Simple Python Test ===\n")
        test_script = "print('Hello from Python!')"
        f.write(f"Running: {test_script}\n")
        try:
            output = subprocess.check_output(
                [sys.executable, "-c", test_script],
                stderr=subprocess.STDOUT,
                text=True
            )
            f.write(f"Output: {output}\n")
        except subprocess.CalledProcessError as e:
            f.write(f"Error: {e.output}\n")
        
        # Test 3: Check for required packages
        f.write("\n=== Required Packages ===\n")
        packages = ['pytest', 'asyncio', 'aiohttp']
        for pkg in packages:
            try:
                __import__(pkg)
                f.write(f"✅ {pkg} is installed\n")
            except ImportError:
                f.write(f"❌ {pkg} is NOT installed\n")
        
        f.write("\nTest completed. Check python_env_test.txt for results.\n")

if __name__ == "__main__":
    main()
