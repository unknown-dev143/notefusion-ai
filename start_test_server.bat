@echo off
echo === Starting Test Server ===
echo.

:: Check Python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Installing required packages...
pip install fastapi uvicorn
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install required packages
    pause
    exit /b 1
)

echo.
echo Starting test server...
echo.
echo Open http://localhost:8000 in your browser
echo.
python test_server.py

pause
