import sys
import os
import subprocess
import platform

def print_section(title):
    print("\n" + "="*50)
    print(f"{title}".center(50))
    print("="*50)

def main():
    print_section("System Information")
    print(f"OS: {platform.system()} {platform.release()}")
    print(f"Processor: {platform.processor()}")
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {sys.version}")
    
    print_section("Environment Variables")
    for key in ['PATH', 'PYTHONPATH', 'VIRTUAL_ENV']:
        print(f"{key}: {os.environ.get(key, 'Not set')}")
    
    print_section("Python Path")
    for p in sys.path:
        print(p)
    
    print_section("File System Check")
    venv_python = os.path.join(os.path.dirname(sys.executable), 'python.exe')
    print(f"Python in venv exists: {os.path.exists(venv_python)}")
    
    print_section("Test Command")
    try:
        result = subprocess.run(
            [sys.executable, "--version"],
            capture_output=True,
            text=True
        )
        print(f"Command output: {result.stdout}")
        print(f"Command error: {result.stderr}")
    except Exception as e:
        print(f"Error running command: {e}")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
