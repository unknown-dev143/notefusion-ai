@echo off
echo Testing Node.js installation...

:: Try to run Node.js
node -v >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Node.js is installed and in PATH
    node -v
    echo.
    echo npm version:
    npm -v
) else (
    echo Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo Make sure to select "Add to PATH" during installation
)

echo.
pause
