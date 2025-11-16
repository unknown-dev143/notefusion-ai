@echo off
echo Starting Python HTTP Server...
echo.
echo 1. Checking for Python...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)

echo 2. Starting Python HTTP Server on port 8000...
start "" "http://localhost:8000/sw-test-direct.html"

python -m http.server 8000

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to start Python server
    echo.
    pause
    exit /b 1
)
