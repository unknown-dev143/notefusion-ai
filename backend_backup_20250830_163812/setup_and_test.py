import os
import sys
import subprocess
import venv
from pathlib import Path

def run_command(command, cwd=None):
    """Run a shell command and print output in real-time."""
    print(f"Running: {command}")
    process = subprocess.Popen(
        command,
        shell=True,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
    )
    
    # Print output in real-time
    while True:
        output = process.stdout.readline()
        if output == '' and process.poll() is not None:
            break
        if output:
            print(output.strip())
    
    return process.poll()

def main():
    # Get the project root directory
    project_root = Path(__file__).parent
    venv_dir = project_root / ".venv"
    python_exec = str(venv_dir / "Scripts" / "python.exe")
    pip_exec = str(venv_dir / "Scripts" / "pip.exe")
    
    print("Setting up Python virtual environment...")
    
    # Create virtual environment if it doesn't exist
    if not venv_dir.exists():
        print("Creating virtual environment...")
        venv.create(venv_dir, with_pip=True)
    
    # Upgrade pip
    print("\nUpgrading pip...")
    run_command(f'"{python_exec}" -m pip install --upgrade pip')
    
    # Install package in development mode with test dependencies
    print("\nInstalling package and test dependencies...")
    run_command(f'"{pip_exec}" install -e ".[dev]"', cwd=project_root)
    
    # Run the tests
    print("\nRunning tests...")
    test_exit_code = run_command(f'"{python_exec}" -m pytest test_flashcard_integration.py -v', cwd=project_root)
    
    # Print final message
    if test_exit_code == 0:
        print("\n✅ All tests passed successfully!")
    else:
        print(f"\n❌ Tests failed with exit code {test_exit_code}")
    
    # Keep the window open
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
