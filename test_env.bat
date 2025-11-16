@echo off
echo ===== Python Environment Test =====
echo.

echo 1. Checking Python installation...
where python
if %ERRORLEVEL% NEQ 0 (
    echo Python is not in PATH. Please install Python 3.8 or later.
    pause
    exit /b 1
)

echo.
echo 2. Python version:
python --version

echo.
echo 3. Python path:
python -c "import sys; print(sys.executable)"

echo.
echo 4. Running a simple Python script...
python -c "print('Hello from Python!')"

echo.
pause
