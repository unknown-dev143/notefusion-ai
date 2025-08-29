@echo off
echo Testing System Configuration...
echo ==========================

echo.
echo 1. Checking Python...
python --version
if %ERRORLEVEL% NEQ 0 echo Python is not installed or not in PATH

echo.
echo 2. Checking Node.js...
node --version
if %ERRORLEVEL% NEQ 0 echo Node.js is not installed or not in PATH

echo.
echo 3. Checking npm...
npm --version
if %ERRORLEVEL% NEQ 0 echo npm is not installed or not in PATH

echo.
echo 4. Checking Python packages...
python -c "import sys; print(f'Python {sys.version}')"
python -c "try: import fastapi; print('FastAPI:', fastapi.__version__); except ImportError: print('FastAPI is not installed')"

echo.
echo System check complete.
pause
