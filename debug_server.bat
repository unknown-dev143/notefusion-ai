@echo off
echo Starting server with debug output...
echo ===================================

:: Check Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not in your system PATH.
    echo Please make sure Python is installed and added to your system PATH.
    pause
    exit /b 1
)

:: Check Python version
python --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python command failed
    pause
    exit /b 1
)

:: Check required packages
echo.
echo Checking required packages...
python -c "import fastapi, uvicorn, requests; print('All required packages are installed')" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Installing required packages...
    pip install fastapi uvicorn requests
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install required packages. Please run as Administrator.
        pause
        exit /b 1
    )
)

:: Start the server
echo.
echo Starting server on http://localhost:8000
echo Press Ctrl+C to stop the server
python -c "import uvicorn; uvicorn.run('test_auth_server:app', host='0.0.0.0', port=8000, reload=True, log_level='debug')"
