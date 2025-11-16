@echo off
echo === Python Environment Diagnostics ===
echo.

echo 1. Checking Python installation...
python --version 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python is not in PATH or not installed.
    echo Please install Python 3.8 or later and make sure to check 'Add Python to PATH' during installation.
    pause
    exit /b 1
)

echo.
echo 2. Creating virtual environment...
python -m venv venv
if not exist "venv\" (
    echo Failed to create virtual environment
    pause
    exit /b 1
)

echo.
echo 3. Activating virtual environment...
call venv\Scripts\activate

if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

echo.
echo 4. Installing required packages...
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install required packages
    pause
    exit /b 1
)

echo.
echo 5. Creating test script...
echo import sys > test_script.py
echo import os >> test_script.py
echo print("Python is working! Version:", sys.version) >> test_script.py
echo print("Current directory:", os.getcwd()) >> test_script.py

echo.
echo 6. Running test script...
python test_script.py

if %ERRORLEVEL% NEQ 0 (
    echo Failed to run test script
    pause
    exit /b 1
)

echo.
echo 7. Starting FastAPI server...
python -c "import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True, log_level='debug')"

pause
