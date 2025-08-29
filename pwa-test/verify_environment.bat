@echo off
echo === PWA Development Environment Check ===
echo.

echo 1. Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js is installed
    node -v
) else (
    echo ❌ Node.js is not installed or not in PATH
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo 2. Checking npm installation...
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ npm is installed
    npm -v
) else (
    echo ❌ npm is not found. Please reinstall Node.js
    pause
    exit /b 1
)

echo.
echo 3. Verifying project structure...
if exist package.json (
    echo ✅ package.json found
) else (
    echo ❌ package.json not found. Running npm init...
    npm init -y
)

echo.
echo 4. Installing dependencies...
if exist node_modules (
    echo ✅ node_modules directory exists
) else (
    echo Installing required packages...
    npm install express cors
)

echo.
echo 5. Starting development server...
if exist server.js (
    echo Starting server...
    start http://localhost:3000/test-pwa.html
    node server.js
) else (
    echo ❌ server.js not found
)

pause
