@echo off
echo === Virtual Environment Check ===
echo.

:: Check if virtual environment exists
if not exist "venv\" (
    echo Virtual environment not found in 'venv' directory
    echo Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created successfully
)

:: Activate virtual environment
call venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

echo.
echo === Python Information ===
python --version
python -c "import sys; print(f'Executable: {sys.executable}')"
python -c "import sys; print(f'Version: {sys.version}')"
python -c "import sys; print(f'Path: {sys.path}')"

echo.
echo === Environment Variables ===
echo PYTHONPATH=%PYTHONPATH%
where python

:: Test package installation
echo.
echo === Package Installation Test ===
python -m pip install --upgrade pip
pip install fastapi uvicorn

echo.
pause
