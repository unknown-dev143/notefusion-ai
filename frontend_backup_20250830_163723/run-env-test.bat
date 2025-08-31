@echo off
setlocal enabledelayedexpansion

echo Running environment test...
echo ==========================
echo.

:: Set up log file
set "logfile=env-test-output.txt"

echo [1/2] Running test script...
node test-env.mjs > "%logfile%" 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Test failed with error code: %ERRORLEVEL%
) else (
    echo ✅ Test completed successfully!
)

echo [2/2] Test output:
echo =================
type "%logfile%"

echo.
echo ==========================
echo Full output saved to: %cd%\%logfile%
pause
