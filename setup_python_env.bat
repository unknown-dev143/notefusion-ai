@echo off
setlocal

echo === Python Environment Setup ===
echo.

REM Check if Python is installed
echo Checking Python installation...
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Python is installed.
    python --version
) else (
    echo Python is not installed or not in PATH.
    echo Please install Python 3.8 or later from https://www.python.org/downloads/
    echo Make sure to check 'Add Python to PATH' during installation.
    pause
    exit /b 1
)

echo.
echo Creating virtual environment...
python -m venv .venv
if not exist ".venv\" (
    echo Failed to create virtual environment
    pause
    exit /b 1
)

echo.
echo Installing required packages...
call .venv\Scripts\activate
pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install required packages
    pause
    exit /b 1
)

echo.
echo Environment setup complete!
echo.
echo To start the server, run:
echo   .\.venv\Scripts\activate
echo   uvicorn main:app --reload
echo.
pause
