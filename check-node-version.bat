@echo off
echo Checking Node.js installation...

where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Node.js is installed at:
    where node
    echo.
    echo Node.js version:
    node -v
    echo.
    echo npm version:
    npm -v
) else (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
)

echo.
pause
