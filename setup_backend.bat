@echo off
echo Setting up NoteFusion AI Backend...
echo ===============================

:: Create virtual environment if it doesn't exist
if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
)

:: Activate virtual environment
call .venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

:: Install core dependencies
echo Installing core dependencies...
pip install --upgrade pip
pip install sqlalchemy fastapi uvicorn python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv pydantic[email] alembic
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install core dependencies
    pause
    exit /b 1
)

:: Install additional requirements if the file exists
if exist backend\requirements.txt (
    echo Installing additional requirements...
    pip install -r backend\requirements.txt
)

:: Set PYTHONPATH and start server
echo Starting server...
set PYTHONPATH=%CD%
python -m uvicorn backend.app.main:app --reload

pause
