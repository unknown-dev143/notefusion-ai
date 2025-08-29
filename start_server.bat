@echo off
echo Starting NoteFusion AI Backend...
echo.

REM Activate the virtual environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo Virtual environment not found. Creating one now...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
    call venv\Scripts\activate.bat
    pip install --upgrade pip
    pip install fastapi uvicorn[standard] requests python-dotenv
)

REM Set Python path and other environment variables
set PYTHONPATH=.
set PYTHONUNBUFFERED=1

REM Load environment variables from .env file if it exists
if exist ".env" (
    set DOTENV_LOADED=1
    for /f "delims==" %%a in (.env) do set %%a
)

REM Start the FastAPI server
echo Starting FastAPI server on http://0.0.0.0:8000
echo Press Ctrl+C to stop the server
echo.
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

if errorlevel 1 (
    echo.
    echo Failed to start the server. Make sure all dependencies are installed.
    echo Run: pip install -r requirements.txt
)

pause
