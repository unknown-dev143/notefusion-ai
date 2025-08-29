@echo off
echo Setting up Python virtual environment...

:: Remove existing virtual environment if it exists
if exist .venv (
    echo Removing existing virtual environment...
    rmdir /s /q .venv
)

:: Create new virtual environment
echo Creating new virtual environment...
python -m venv .venv --clear
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create virtual environment
    pause
    exit /b 1
)

:: Activate and upgrade pip
call .venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)

echo Upgrading pip...
python -m pip install --upgrade pip

:: Install backend dependencies
echo Installing backend dependencies...
pip install -r backend\requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Virtual environment setup complete!
echo.
echo To activate the virtual environment, run:
echo    .venv\Scripts\activate
echo.
echo Then start the backend with:
echo    python -m uvicorn backend.app.main:app --reload

pause
