@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Starting Electron with Debug Logging
echo ===================================
echo.

:: Set environment variables for debugging
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1
set ELECTRON_DEFAULT_ERROR_MODE=1
set NODE_OPTIONS=--trace-warnings

:: Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

:: Get timestamp for log file
for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set "dt=%%a"
set "timestamp=!dt:~0,4!-!dt:~4,2!-!dt:~6,2!_!dt:~8,2!-!dt:~10,2!-!dt:~12,2!"
set "logfile=logs\electron-debug-!timestamp!.log"

echo Logging to: !logfile!
echo.

echo [1/3] Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [2/3] Checking Electron installation...
npm list electron --depth=0 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠ Electron not found. Installing...
    call npm install electron@latest --save-dev
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install Electron
        pause
        exit /b 1
    )
)

echo [3/3] Starting Electron...
echo.

echo ========== Starting Electron ========== > "!logfile!"
echo Timestamp: !date! !time! >> "!logfile!"
echo Node.js: >> "!logfile!"
node -v >> "!logfile!" 2>&1
echo. >> "!logfile!"
echo npm: >> "!logfile!"
npm -v >> "!logfile!" 2>&1
echo. >> "!logfile!"

:: Run Electron with logging
npx electron . >> "!logfile!" 2>&1

:: Check the exit code
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===================================
    echo Electron failed with error code: %ERRORLEVEL%
    echo Check !logfile! for details
    echo ===================================
    echo.
    type "!logfile!" | findstr /i /c:"error" /c:"fail" /c:"warn"
) else (
    echo.
    echo ===================================
    echo Electron started successfully!
    echo ===================================
    echo.
)

pause
