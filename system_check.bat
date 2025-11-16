@echo off
echo ===== System Environment Check =====
echo.

echo 1. Python Installation:
where python
where python3
where python.exe
where python3.exe

echo.
echo 2. Python Version:
python --version

:: Create a temporary Python script to check environment
echo import os, sys, platform > check_env.py
echo print("Python Executable:", sys.executable) >> check_env.py
echo print("Python Version:", sys.version) >> check_env.py
echo print("Current Directory:", os.getcwd()) >> check_env.py
echo print("Environment Variables:", [k for k in os.environ if 'PYTHON' in k.upper()]) >> check_env.py
echo print("System Platform:", platform.platform()) >> check_env.py

python check_env.py
del check_env.py

echo.
echo 3. Checking if Python can write to current directory:
echo Test file content > test_write.txt
if exist test_write.txt (
    echo Successfully wrote to test_write.txt
    del test_write.txt
) else (
    echo Failed to write to current directory
)

echo.
echo 4. Testing basic Python I/O:
python -c "import sys; print('STDOUT test'); print('STDERR test', file=sys.stderr)"

echo.
echo 5. Checking for Python in PATH:
echo %PATH% | find "Python"

echo.
echo ===== Check Complete =====
pause
