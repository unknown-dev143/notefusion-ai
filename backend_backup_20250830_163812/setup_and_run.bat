@echo off
echo Setting up NoteFusion AI Backend...
echo ===================================

:: Check Python version
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not found or not in PATH
    pause
    exit /b 1
)

:: Create virtual environment if it doesn't exist
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to create virtual environment
        pause
        exit /b 1
    )
)

:: Activate virtual environment
call .venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to activate virtual environment
    pause
    exit /b 1
)

:: Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

:: Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
)

:: Run database migrations
echo Setting up database...
python init_db.py
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Database initialization had issues, but continuing...
)

:: Start the server
echo Starting backend server...
python main.py

:: Keep the window open
pause
