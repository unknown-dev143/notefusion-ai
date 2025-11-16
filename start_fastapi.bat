@echo off
echo ===== Starting FastAPI Server =====
echo.

:: Check if Python is installed
echo Checking Python installation...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python 3.8 or later and make sure it's added to your system PATH.
    pause
    exit /b 1
)

:: Install required packages
echo Installing required packages...
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv alembic
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install required packages.
    pause
    exit /b 1
)

:: Set environment variables
echo Setting up environment...
set PYTHONPATH=.
set PYTHONUNBUFFERED=1

:: Start the FastAPI server
echo Starting FastAPI server...
python -m uvicorn minimal_app:app --host 0.0.0.0 --port 5000 --reload

pause
