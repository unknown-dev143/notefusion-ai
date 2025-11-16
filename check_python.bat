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
if not exist ".venv\" (
    echo Failed to create virtual environment
    pause
    exit /b 1
)

echo.
echo 3. Activating virtual environment...
call .venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

echo.
echo 4. Installing requirements...
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install requirements
    pause
    exit /b 1
)

echo.
echo 5. Verifying installation...
python -c "import sys; print(f'Python {sys.version}'); print('\n'.join(sys.path))"
if %ERRORLEVEL% NEQ 0 (
    echo Python verification failed
    pause
    exit /b 1
)

echo.
echo Environment setup complete!
pause
