@echo off
echo Starting NoteFusion AI Backend...
echo.

echo Checking Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python 3.8 or later and make sure it's added to your system PATH.
    pause
    exit /b 1
)

echo.
echo Activating virtual environment...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo Virtual environment not found. Creating a new one...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create virtual environment.
        pause
        exit /b 1
    )
    call venv\Scripts\activate.bat
)

echo.
echo Installing dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo Starting FastAPI server...
set PYTHONPATH=.
python -m uvicorn minimal_app:app --host 0.0.0.0 --port 5000 --reload

pause
