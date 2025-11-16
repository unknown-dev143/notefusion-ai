@echo off
echo Installing required Python packages...

:: Check if virtual environment exists, if not create one
if not exist "venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
)

:: Activate the virtual environment
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

:: Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip
if errorlevel 1 (
    echo Failed to upgrade pip
    pause
    exit /b 1
)

:: Install required packages
echo Installing dependencies...
pip install fastapi uvicorn[standard] requests python-dotenv sqlalchemy pydantic
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Installation completed successfully!
echo You can now start the server using: start_server.bat
pause
