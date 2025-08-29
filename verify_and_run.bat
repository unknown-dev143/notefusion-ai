@echo off
echo === Python Environment Verification ===
echo.

:: Check Python version
echo 1. Checking Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not in PATH. Please install Python 3.8 or later.
    pause
    exit /b 1
)

:: Check Python executable
echo.
echo 2. Python executable path:
python -c "import sys; print(sys.executable)"

:: Check Python path
echo.
echo 3. Python path:
python -c "import sys; print('\n'.join(sys.path))"

:: Check FastAPI installation
echo.
echo 4. Checking FastAPI installation...
python -c "import fastapi; print(f'FastAPI version: {fastapi.__version__}')"
if %ERRORLEVEL% NEQ 0 (
    echo FastAPI is not installed. Installing...
    pip install fastapi uvicorn
)

:: Create a minimal FastAPI app
echo.
echo 5. Creating a minimal FastAPI app...
echo from fastapi import FastAPI > test_app.py
echo app = FastAPI() >> test_app.py
echo @app.get("/") >> test_app.py
echo async def root(): return {"message": "Hello, World!"} >> test_app.py

echo.
echo 6. Starting FastAPI server...
echo Server will be available at: http://localhost:8000
echo.
python -m uvicorn test_app:app --host 0.0.0.0 --port 8000 --reload

pause
