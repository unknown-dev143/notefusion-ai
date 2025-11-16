@echo off
echo Verifying Node.js installation...

:: Try to get Node.js version
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js is installed and in PATH
    echo Node.js version: 
    node --version
    echo.
    echo ✅ npm version:
    npm --version
    pause
    exit /b 0
) else (
    echo ❌ Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js v22.18.0 or later from:
    echo https://nodejs.org/
    echo.
    echo Make sure to check "Add to PATH" during installation.
    echo.
    pause
    exit /b 1
)
