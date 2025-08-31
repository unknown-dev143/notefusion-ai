@echo off

echo Creating virtual environment...
python -m venv .venv
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create virtual environment
    pause
    exit /b 1
)

call .venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

echo Installing dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo Setting up environment variables...
if not exist .env (
    copy .env.example .env
    echo Please edit .env file with your configuration
    pause
)

echo Starting FastAPI server...
set PYTHONPATH=%CD%
.venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
