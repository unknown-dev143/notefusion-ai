@echo off
echo ===== Setting Up Lightweight FastAPI Server =====
echo.

:: Check Python installation
echo Checking Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python 3.8 or later and make sure it's added to your system PATH.
    pause
    exit /b 1
)

:: Create virtual environment if it doesn't exist
echo.
echo Setting up virtual environment...
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
)

:: Activate virtual environment
call .venv\Scripts\activate.bat

:: Install requirements
echo.
echo Installing required packages...
pip install -r requirements_light.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install required packages
    pause
    exit /b 1
)

:: Set environment variables
echo.
echo Setting up environment...
set PYTHONPATH=.
set PYTHONUNBUFFERED=1

:: Start FastAPI server
echo.
echo Starting FastAPI server...
python -m uvicorn minimal_app:app --host 0.0.0.0 --port 5000 --reload

pause
