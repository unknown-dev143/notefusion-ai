@echo off
setlocal enabledelayedexpansion

echo ===== Fixing Python Environment =====
echo.

echo 1. Removing existing virtual environment...
if exist "venv" (
    rmdir /s /q venv
    echo Removed existing virtual environment
) else (
    echo No existing virtual environment found
)

echo.
echo 2. Finding Python installations...
where python

echo.
echo 3. Using system Python to create new virtual environment...
python -m venv venv
if not exist "venv\Scripts\python.exe" (
    echo Failed to create virtual environment
    echo Trying with full Python path...
    "C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe" -m venv venv
    if not exist "venv\Scripts\python.exe" (
        echo Failed to create virtual environment with full path
        pause
        exit /b 1
    )
)

echo.
echo 4. Verifying new virtual environment...
venv\Scripts\python.exe --version
if !ERRORLEVEL! NEQ 0 (
    echo Failed to verify Python in virtual environment
    pause
    exit /b 1
)

echo.
echo 5. Installing dependencies...
venv\Scripts\pip.exe install --upgrade pip
venv\Scripts\pip.exe install -r requirements.txt

echo.
echo ===== Environment Setup Complete =====
echo.
echo To run the application, use:
echo    venv\Scripts\python.exe minimal_app.py
echo.
pause
