@echo off
echo ===================================
echo Cleaning up and reinstalling...
echo ===================================

:: Clean up old installations
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)

if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)

:: Install dependencies
echo.
echo Installing dependencies...
call npm install --legacy-peer-deps

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===================================
    echo Failed to install dependencies
    echo ===================================
    pause
    exit /b 1
)

echo.
echo ===================================
echo Installation complete!
echo ===================================
echo.
echo Next steps:
echo 1. Run: npx electron electron-simple.js
echo    or
    echo 2. Run: npm run electron:dev

pause
