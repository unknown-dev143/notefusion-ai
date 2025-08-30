@echo off
echo === Environment Fix Script ===
echo.

:: Check Python installation
echo Checking Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and ensure it's added to PATH
    pause
    exit /b 1
)

echo.
echo === Creating Virtual Environment ===
if exist venv (
    echo Removing existing virtual environment...
    rmdir /s /q venv
)

python -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Failed to create virtual environment
    pause
    exit /b 1
)

:: Activate the virtual environment
call venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)

echo.
echo === Installing Dependencies ===
pip install --upgrade pip
pip install -r requirements.txt
pip install pytest pytest-asyncio pytest-cov

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo === Running Quick Check ===
python quick_check.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Quick check failed
    pause
    exit /b 1
)

echo.
echo === Running Tests ===
python -m pytest tests/test_basic.py -v

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Tests failed
    pause
    exit /b 1
)

echo.
echo ✅ Environment setup and tests completed successfully!
pause
