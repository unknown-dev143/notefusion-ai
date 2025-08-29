@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Running Electron Test Script
echo ===================================
echo.

:: Set environment variables for debugging
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1
set NODE_OPTIONS=--trace-warnings

:: Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

:: Get timestamp for log file
for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set "dt=%%a"
set "timestamp=!dt:~0,4!-!dt:~4,2!-!dt:~6,2!_!dt:~8,2!-!dt:~10,2!-!dt:~12,2!"
set "logfile=logs\electron-test-!timestamp!.log"

echo Logging to: !logfile!
echo.

echo [1/3] Checking Node.js...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [2/3] Checking Electron...
npx electron --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠ Electron not found. Installing...
    call npm install electron@latest --save-dev
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install Electron
        pause
        exit /b 1
    )
)

echo [3/3] Running test script...
echo.

:: Run the test script
node electron-simple-test.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===================================
    echo Test script failed with error code: %ERRORLEVEL%
    echo Check electron-test.log for details
    echo ===================================
    echo.
    type electron-test.log
) else (
    echo.
    echo ===================================
    echo Test script completed successfully!
    echo ===================================
    echo.
)

pause
