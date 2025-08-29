@echo off
echo === Environment Check ===
echo.

echo 1. Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    node -v >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Node.js is in PATH but not working correctly
    ) else (
        echo ✓ Node.js is installed: %NODE_VERSION%
    )
)

echo.
echo 2. Checking npm installation...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed or not in PATH
) else (
    npm -v >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ npm is in PATH but not working correctly
    ) else (
        echo ✓ npm is installed: %NPM_VERSION%
    )
)

echo.
echo 3. Running test script...
echo.

node verify-node.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Test script failed with error code %ERRORLEVEL%
) else (
    echo.
    echo ✓ Test script completed successfully
)

echo.
pause
