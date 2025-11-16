@echo off
echo Testing Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python not found in PATH. Trying python3...
    python3 --version
    if %ERRORLEVEL% NEQ 0 (
        echo Python not found. Please install Python 3.7 or later.
        pause
        exit /b 1
    )
)

echo.
echo Python is working! Running a simple test...
python -c "print('Hello from Python!'); import sys; print(f'Python version: {sys.version}'); print(f'Executable: {sys.executable}')"

if %ERRORLEVEL% NEQ 0 (
    echo Python test failed.
    pause
    exit /b 1
)

echo.
echo Python environment is working correctly.
pause
