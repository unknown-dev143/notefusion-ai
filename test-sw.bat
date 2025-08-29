@echo off
echo Starting Service Worker Test...
echo.
echo 1. Make sure all required files are in place
if not exist "sw-offline.js" (
    echo [ERROR] sw-offline.js is missing!
    pause
    exit /b 1
)

if not exist "sw-test.html" (
    echo [ERROR] sw-test.html is missing!
    pause
    exit /b 1
)

echo [✓] All required files found
echo.
echo 2. Starting test server...
start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --user-data-dir="%TEMP%\chrome-test-profile" --disable-web-security http://localhost:3000/sw-test.html

python -m http.server 3000

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to start server. Make sure Python is installed and in your PATH.
    echo.
    pause
    exit /b 1
)
