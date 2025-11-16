@echo off
echo Starting NoteFusion AI Backend...
echo ===============================

:: Check if .env exists, if not create from .env.example
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please edit the .env file with your configuration
    pause
    exit /b 1
)

:: Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
)

:: Activate virtual environment
call venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

:: Install dependencies
echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

:: Initialize database
echo Initializing database...
python init_db.py
if %ERRORLEVEL% NEQ 0 (
    echo Failed to initialize database
    pause
    exit /b 1
)

:: Start the server
echo Starting server...
uvicorn minimal_app:app --host 0.0.0.0 --port 5000 --reload

pause
