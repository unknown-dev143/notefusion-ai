@echo off
setlocal enabledelayedexpansion

echo ===== Starting NoteFusion AI =====

echo 1. Setting up environment...
set PYTHONPATH=%~dp0

:: Use full path to Python in virtual environment
set PYTHON=%~dp0venv\Scripts\python.exe

if not exist "!PYTHON!" (
    echo Error: Python not found at: !PYTHON!
    echo Please ensure the virtual environment is set up correctly.
    pause
    exit /b 1
)

echo 2. Checking Python version...
"!PYTHON!" --version
if !ERRORLEVEL! NEQ 0 (
    echo Error: Failed to run Python
    pause
    exit /b 1
)

echo 3. Running NoteFusion AI...
"!PYTHON!" "%~dp0minimal_app.py"

if !ERRORLEVEL! NEQ 0 (
    echo.
    echo Application exited with error code !ERRORLEVEL!
) else (
    echo.
    echo Application completed successfully
)

pause
