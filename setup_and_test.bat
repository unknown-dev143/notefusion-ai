@echo off
setlocal enabledelayedexpansion

echo === Setting up Python Environment ===

:: Check if virtual environment exists
if not exist "venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment
        exit /b 1
    )
) else (
    echo Virtual environment already exists
)

echo.
echo === Installing Dependencies ===
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Failed to activate virtual environment
    exit /b 1
)

pip install --upgrade pip
pip install fastapi uvicorn[standard] requests

if errorlevel 1 (
    echo Failed to install dependencies
    exit /b 1
)

echo.
echo === Testing Python Environment ===
python -c "import sys; print('Python Path:', sys.executable); print('Version:', sys.version)

if errorlevel 1 (
    echo Python test failed
    exit /b 1
)

echo.
echo === Starting FastAPI Server ===
start "" cmd /k "cd /d %~dp0backend && call ..\venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload"

timeout /t 5

echo.
echo === Running Security Tests ===
python backend\test_security.py

if errorlevel 1 (
    echo Security tests failed
    exit /b 1
)

echo.
echo Setup and testing completed successfully!
pause
