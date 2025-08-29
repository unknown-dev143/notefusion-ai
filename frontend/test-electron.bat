@echo off
echo Testing Electron setup...

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install --legacy-peer-deps
) else (
    echo Dependencies already installed.
)

echo.
echo =========================================
echo Starting Electron in development mode...
echo =========================================
echo.

call npm run electron:dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo =========================================
    echo Error: Failed to start Electron
    echo =========================================
    echo.
    echo Common issues:
    echo 1. Make sure you have Node.js v22.18.0 installed
    echo 2. Try deleting node_modules and running again
    echo 3. Check for any error messages above
    echo.
    pause
) else (
    echo.
    echo =========================================
    echo Electron started successfully!
    echo =========================================
    echo.
)
