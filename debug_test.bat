@echo off
echo ===== Python Environment Debug =====
echo.

echo 1. Checking Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not in PATH. Trying with full path...
    "C:\Program Files\Python312\python.exe" --version
    if %ERRORLEVEL% NEQ 0 (
        echo Python installation not found. Please install Python 3.12.7
        pause
        exit /b 1
    )
)

echo.
echo 2. Running test script with full path...
"C:\Program Files\Python312\python.exe" -v -c "import sys; print('Python Executable:', sys.executable); print('Python Path:', sys.path)"

echo.
echo 3. Testing basic Python functionality...
echo print('Hello from Python!') > test_script.py
"C:\Program Files\Python312\python.exe" test_script.py
del test_script.py

echo.
echo 4. Testing FastAPI import...
"C:\Program Files\Python312\python.exe" -c "import fastapi; print('FastAPI version:', fastapi.__version__)"

echo.
echo 5. Testing Uvicorn import...
"C:\Program Files\Python312\python.exe" -c "import uvicorn; print('Uvicorn version:', uvicorn.__version__)"

echo.
echo 6. Checking for running Python processes...
tasklist | findstr /i python

echo.
echo ===== Debug Complete =====
pause
