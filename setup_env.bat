@echo off
echo Setting up Python environment...

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed or not in PATH. Please install Python 3.8 or later.
    pause
    exit /b 1
)

echo Creating virtual environment...
python -m venv venv

if not exist "venv\" (
    echo Failed to create virtual environment
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing required packages...
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install required packages
    pause
    exit /b 1
)

echo Environment setup complete!
pause
