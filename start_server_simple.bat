@echo off
setlocal

REM Activate the virtual environment
if exist ".venv\Scripts\activate" (
    call .venv\Scripts\activate
) else (
    echo Virtual environment not found. Please run setup_python_env.bat first.
    pause
    exit /b 1
)

echo Starting FastAPI server...
echo Open http://localhost:8000 in your browser
echo Press Ctrl+C to stop the server

uvicorn main:app --reload

pause
