import os
import sys
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

print("=== Environment Check ===")
print(f"Python Executable: {sys.executable}")
print(f"Python Version: {sys.version}")
print(f"Working Directory: {os.getcwd()}")
print("\n=== Python Path ===")
for path in sys.path:
    print(f"- {path}")

print("\n=== Running Test Command ===")
print(run_command(f'"{sys.executable}" -c "print(\'Test command successful!\')"'))

print("\n=== Checking FastAPI Installation ===")
try:
    import fastapi
    print(f"FastAPI Version: {fastapi.__version__}")
except ImportError:
    print("FastAPI is not installed")

print("\nEnvironment check complete.")
