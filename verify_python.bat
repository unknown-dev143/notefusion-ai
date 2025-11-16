@echo off
echo ===== Python Environment Test =====
echo.

echo 1. Checking Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not in PATH. Please install Python 3.8 or later.
    pause
    exit /b 1
)

echo.
echo 2. Running a simple Python command...
python -c "print('Hello from Python!'); import sys; print(f'Python version: {sys.version}')"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to run Python command.
    pause
    exit /b 1
)

echo.
echo 3. Checking Python path...
python -c "import sys; print('\n'.join(sys.path))"

echo.
pause
