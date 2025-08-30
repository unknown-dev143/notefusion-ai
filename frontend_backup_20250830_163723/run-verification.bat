@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Node.js Environment Verification
echo ===================================
echo.

:: Set up log file
set "logfile=node-verification-log.txt"

echo [1/3] Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH > "%logfile%"
    echo ❌ Node.js is not installed or not in PATH
    type "%logfile%"
    pause
    exit /b 1
)

echo [2/3] Running verification script...
node verify-node-setup.js > "%logfile%" 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Verification failed with error code: %ERRORLEVEL%
) else (
    echo ✅ Verification completed successfully!
)

echo [3/3] Results:
type "%logfile%"

echo.
echo ===================================
echo Verification complete!
echo Full log saved to: %cd%\%logfile%
echo ===================================
pause
