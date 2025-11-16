@echo off
echo ===== Python Setup Script =====
echo.

:: Check if Python is installed
echo Checking Python installation...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python 3.8 or later from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

:: Get Python version
for /f "tokens=2" %%a in ('python --version 2^>^&1') do set PYTHON_VERSION=%%a
for /f "tokens=1-3 delims=." %%a in ("%PYTHON_VERSION%") do set PYTHON_MAJOR=%%a& set PYTHON_MINOR=%%b

:: Check Python version
if %PYTHON_MAJOR% LSS 3 (
    echo Python 3.8 or later is required. Found version %PYTHON_VERSION%
    pause
    exit /b 1
) else if %PYTHON_MAJOR% EQU 3 if %PYTHON_MINOR% LSS 8 (
    echo Python 3.8 or later is required. Found version %PYTHON_VERSION%
    pause
    exit /b 1
)

echo Python %PYTHON_VERSION% is installed.
echo.

echo Creating virtual environment...
python -m venv .venv
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create virtual environment.
    pause
    exit /b 1
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment.
    pause
    exit /b 1
)

echo Installing required packages...
pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv alembic
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install required packages.
    pause
    exit /b 1
)

echo.
echo Setup completed successfully!
echo To start the server, run: .\start_server.bat
pause
