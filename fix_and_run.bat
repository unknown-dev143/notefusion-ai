@echo off
echo Fixing and starting NoteFusion AI...
echo ===================================

:: 1. Remove existing virtual environment if it exists
if exist .venv (
    echo Removing existing virtual environment...
    rmdir /s /q .venv
)

:: 2. Create new virtual environment
echo Creating new virtual environment...
python -m venv .venv
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create virtual environment
    pause
    exit /b 1
)

:: 3. Activate and install dependencies
call .venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)

:: 4. Install requirements
echo Installing requirements...
pip install -r backend/requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install requirements
    pause
    exit /b 1
)

:: 5. Set PYTHONPATH and start server
echo Starting server...
set PYTHONPATH=%CD%
python -m uvicorn backend.app.main:app --reload

pause
