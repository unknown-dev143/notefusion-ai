@echo off
echo Checking Node.js installation...
echo =============================

where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js is installed
    echo Node.js version:
    node -v
    echo.
    echo npm version:
    npm -v
    echo.
    echo Please run the following commands to start the application:
    echo 1. cd c:\Users\User\notefusion-ai\notefusion-ai\frontend
    echo 2. npm install --legacy-peer-deps
    echo 3. npm run dev
) else (
    echo ❌ Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js v22.18.0 or later from:
    echo https://nodejs.org/
    echo.
    echo Installation steps:
    echo 1. Download the LTS version from the link above
    echo 2. Run the installer
    echo 3. Make sure to check "Automatically install the necessary tools"
    echo 4. Complete the installation
    echo 5. Restart your computer
    echo.
    echo After restart, open a new Command Prompt and run this script again.
)

echo.
pause
