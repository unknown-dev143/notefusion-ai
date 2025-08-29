import sys
import subprocess

def run_tests():
    try:
        # Run pytest with the test file
        result = subprocess.run(
            [sys.executable, "-m", "pytest", "tests/test_hello.py", "-v"],
            capture_output=True,
            text=True
        )
        
        # Write output to a file
        with open("test_execution_output.txt", "w") as f:
            f.write("=== STDOUT ===\n")
            f.write(result.stdout)
            f.write("\n=== STDERR ===\n")
            f.write(result.stderr)
            
        print(f"Test execution completed. Output written to test_execution_output.txt")
        
    except Exception as e:
        with open("test_execution_error.txt", "w") as f:
            f.write(f"Error executing tests: {str(e)}")
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    run_tests()
