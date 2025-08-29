@echo off
echo Setting up test environment...
echo.

echo Step 1: Installing required packages...
pip install fastapi uvicorn requests >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install required packages. Please run as Administrator.
    pause
    exit /b 1
)

echo Step 2: Starting test server...
start "Test Server" cmd /k "cd /d %~dp0backend && python test_auth_server.py"

timeout /t 5 >nul

echo Step 3: Running authentication tests...
start "Test Client" cmd /k "cd /d %~dp0backend && python verify_auth.py"

echo.
echo Test environment is ready!
echo - Server is running in the first window
echo - Test results will appear in the second window
echo.
pause
