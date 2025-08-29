@echo off
echo Starting Service Worker Test Server...
echo.
echo 1. Checking for Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo 2. Starting server...
start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --user-data-dir="%TEMP%\chrome-test-profile" --disable-web-security http://localhost:3000/sw-test-direct.html

node sw-test-server.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to start server
    echo.
    pause
    exit /b 1
)
