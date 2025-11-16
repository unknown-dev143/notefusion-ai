@echo off
echo Testing Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not in PATH. Please install Python 3.8 or later.
    pause
    exit /b 1
)

echo.
echo Running a simple Python command...
python -c "print('Hello from Python!')"

echo.
echo Testing Python script execution...
echo print("This is a test script") > test_script.py
python test_script.py
del test_script.py

echo.
pause
