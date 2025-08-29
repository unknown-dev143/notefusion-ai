@echo off
setlocal enabledelayedexpansion

echo ===== Starting NoteFusion AI Backend =====
echo.

:: Set environment variables
set PYTHONPATH=.
set PYTHONUNBUFFERED=1
set PORT=5000

:: Check Python
echo 1. Checking Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not in PATH. Please install Python 3.8 or later.
    pause
    exit /b 1
)

:: Install dependencies
echo.
echo 2. Installing dependencies...
pip install -r requirements_light.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

:: Start the server
echo.
echo 3. Starting NoteFusion AI Backend...
echo Server will be available at: http://localhost:%PORT%
echo.

python -m uvicorn minimal_app:app --host 0.0.0.0 --port %PORT% --reload

pause
