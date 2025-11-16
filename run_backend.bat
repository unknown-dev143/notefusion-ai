@echo off
REM Run the FastAPI backend with proper environment setup

SET PYTHONPATH=%~dp0;%PYTHONPATH%

REM Check if Python is available
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not in the system PATH.
    echo Please ensure Python is installed and added to your system PATH.
    pause
    exit /b 1
)

echo Setting up Python environment...
python -m venv .venv
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create virtual environment.
    pause
    exit /b 1
)

REM Activate the virtual environment and install requirements
call .venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment.
    pause
    exit /b 1
)

echo Installing dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env >nul
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create .env file.
        pause
        exit /b 1
    )
    echo Please edit the .env file with your configuration.
    pause
)

echo Starting FastAPI server...
cd backend
uvicorn app.main:app --reload

pause
