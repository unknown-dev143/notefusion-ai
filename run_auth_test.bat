@echo off
echo ===== Starting Authentication Test Setup =====
echo.
echo Step 1: Checking Python installation...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not in your system PATH.
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

echo.
echo Step 2: Installing required packages...
pip install fastapi uvicorn requests
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install required packages.
    echo Please try running this script as Administrator.
    pause
    exit /b 1
)

echo.
echo Step 3: Starting test server...
start "Test Server" cmd /k "cd /d %~dp0backend && python test_auth_server.py"

timeout /t 5 >nul

echo.
echo Step 4: Running authentication tests...
start "Test Client" cmd /k "cd /d %~dp0backend && python verify_auth.py"

echo.
echo ===== Setup Complete =====
echo - Test server is running in the first window
echo - Test results will appear in the second window
echo.
pause
