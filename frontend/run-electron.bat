@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Starting Electron with Node.js v22.18.0
echo ===================================

:: Set Node.js version
set NODE_VERSION=22.18.0

:: Check if nvm is available
where nvm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using nvm to set Node.js version to v%NODE_VERSION%
    call nvm use %NODE_VERSION%
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to set Node.js version. Installing v%NODE_VERSION%...
        call nvm install %NODE_VERSION%
        if %ERRORLEVEL% NEQ 0 (
            echo Failed to install Node.js v%NODE_VERSION%
            pause
            exit /b 1
        )
        call nvm use %NODE_VERSION%
    )
)

:: Verify Node.js version
node -v
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in PATH
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install --legacy-peer-deps
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Set Electron debug environment variables
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1
set NODE_OPTIONS=--trace-warnings

:: Run the Electron app
echo.
echo ===================================
echo Starting Electron...
echo ===================================
echo.

call npx electron electron-debug.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===================================
    echo Electron failed to start with error code: %ERRORLEVEL%
    echo ===================================
    echo.
    echo Please check the following:
    echo 1. Node.js v%NODE_VERSION% is installed
    echo 2. All dependencies are installed (node_modules exists)
    echo 3. No firewall or antivirus is blocking Electron
    echo 4. Check logs in the 'logs' directory
    echo.
    pause
) else (
    echo.
    echo ===================================
    echo Electron started successfully!
    echo ===================================
    echo.
)

endlocal
