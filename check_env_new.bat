@echo off
echo ===== Python 3.12.10 Environment Check =====
echo.

echo 1. Checking Python installation...
where python
python --version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python 3.12.10 is not properly installed or not in PATH
    echo Please ensure you've checked "Add Python 3.12 to PATH" during installation
    pause
    exit /b 1
)

echo.
echo 2. Checking Python executable path...
python -c "import sys; print(f'Python executable: {sys.executable}')"

:: Create a simple test script
echo.
echo 3. Creating test script...
echo import sys > test_env.py
echo print('Python version:', sys.version) >> test_env.py
echo print('Executable:', sys.executable) >> test_env.py
echo print('Path:', sys.path) >> test_env.py

echo.
echo 4. Running test script...
python test_env.py

echo.
echo 5. Cleaning up...
del test_env.py

echo.
echo ===== Environment Check Complete =====
echo If you see Python version 3.12.10 above, the installation is successful!
echo.
pause
