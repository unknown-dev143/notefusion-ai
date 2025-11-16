@echo off
echo Setting up NoteFusion AI...
echo ===========================

:: Check Python
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

:: Create and activate virtual environment
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
)

call venv\Scripts\activate

:: Install backend dependencies
echo Installing backend dependencies...
pip install --upgrade pip
pip install -r backend\requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

:: Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo Setup completed successfully!
echo.
echo To start the backend server, run: start_backend.bat
echo To start the frontend, open a new terminal and run: cd frontend && npm run dev
echo.
pause
