@echo off
echo Setting up Python environment for NoteFusion AI...

:: Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
)

:: Activate virtual environment
call venv\Scripts\activate
if errorlevel 1 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

echo Upgrading pip...
python -m pip install --upgrade pip

:: Install required packages
echo Installing required packages...
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv pydantic-settings
if errorlevel 1 (
    echo Failed to install required packages
    pause
    exit /b 1
)

echo.
echo Setup completed successfully!
echo.
echo To start the development server, run:
echo    .\start_server.bat
echo.
pause
