@echo off
echo Setting up NoteFusion AI...
echo =======================

:: Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python 3.8+ first.
    pause
    exit /b 1
)

:: Create and activate virtual environment
echo Creating virtual environment...
python -m venv .venv
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create virtual environment.
    pause
    exit /b 1
)

call .venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment.
    pause
    exit /b 1
)

:: Install requirements
echo Installing required packages...
pip install -r backend\requirements-minimal.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install requirements.
    pause
    exit /b 1
)

:: Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy /Y .env.example .env
)

echo.
echo Setup complete! Starting the application...
echo.

:: Start the backend server
start "Backend" cmd /k "cd backend && .venv\Scripts\python -m uvicorn main:app --reload"

:: Start the frontend
if exist "frontend\package.json" (
    echo Starting frontend development server...
    start "Frontend" cmd /k "cd frontend && npm start"
) else (
    echo Frontend not found. Skipping frontend startup.
)

echo.
echo Application is starting...
echo - Backend will be available at http://localhost:8000
echo - API documentation at http://localhost:8000/docs
echo - Frontend will be available at http://localhost:3000 (if installed)
echo.
pause
