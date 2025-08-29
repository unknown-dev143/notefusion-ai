@echo off
echo Setting up NoteFusion AI Development Environment...
echo =============================================

:: Check Python version
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.8+ from: https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Create virtual environment
echo Creating Python virtual environment...
python -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create virtual environment.
    pause
    exit /b 1
)

:: Activate and install backend dependencies
call venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to activate virtual environment.
    pause
    exit /b 1
)

echo Installing backend dependencies...
pip install -r backend\requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)

:: Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some frontend dependencies had issues. Trying to continue...
)

:: Return to project root
cd ..

echo.
echo =============================================
echo Setup completed successfully!
echo.
echo To start the application, run:
echo 1. Start backend: python -m uvicorn backend.app.main:app --reload
echo 2. Start frontend: cd frontend && npm run dev
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:8000
echo.
pause
