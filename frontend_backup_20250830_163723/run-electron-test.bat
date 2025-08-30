@echo off
echo ===================================
echo Starting Electron Test
echo ===================================
echo.

:: Set environment variables for debugging
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1
set ELECTRON_DEFAULT_ERROR_MODE=1
set NODE_OPTIONS=--trace-warnings

:: Create logs directory
if not exist "logs" mkdir logs

:: Get timestamp for log file
for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%_%dt:~8,2%-%dt:~10,2%-%dt:~12,2%"

:: Run the test with logging
node electron-test-launcher.js > "logs\electron-test-%timestamp%.log" 2>&1

:: Check the exit code
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===================================
    echo Electron test failed with error code: %ERRORLEVEL%
    echo Check logs\electron-test-%timestamp%.log for details
    echo ===================================
    echo.
    pause
) else (
    echo.
    echo ===================================
    echo Electron test completed successfully!
    echo ===================================
    echo.
)

pause
