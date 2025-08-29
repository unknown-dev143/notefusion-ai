@echo off
echo === Python Environment Check ===
echo.

echo 1. Checking Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not in PATH. Please install Python 3.8 or later.
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo 2. Creating virtual environment...
python -m venv .venv
if not exist ".venv\\" (
    echo Failed to create virtual environment
    echo Trying with full Python path...
    for /f "tokens=*" %%i in ('where python') do (
        echo Found Python at: %%i
        "%%i" -m venv .venv
        if exist ".venv\\" (
            echo Successfully created virtual environment
            goto venv_created
        )
    )
    echo Could not create virtual environment with any Python installation
    pause
    exit /b 1
) else (
    :venv_created
    echo Virtual environment created successfully
)

echo.
echo 3. Activating virtual environment...
call .venv\\Scripts\\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

echo.
echo 4. Installing required packages...
pip install pytest pytest-asyncio aiohttp
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install required packages
    pause
    exit /b 1
)

echo.
echo 5. Running tests...
python -m pytest backend/test_audio_services.py -v

pause
