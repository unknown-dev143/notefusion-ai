@echo off
echo ===== Starting NoteFusion AI Backend =====
echo.

echo Checking Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not in PATH. Please install Python 3.8 or later.
    pause
    exit /b 1
)

echo.
echo Setting up environment...
set PYTHONPATH=.
set PYTHONUNBUFFERED=1

echo.
echo Installing required packages...
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv alembic
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install required packages.
    pause
    exit /b 1
)

echo.
echo Starting FastAPI server...
python -m uvicorn minimal_app:app --host 0.0.0.0 --port 5000 --reload

pause
