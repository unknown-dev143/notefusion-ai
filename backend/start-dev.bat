@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting NoteFusion Backend...
echo ===============================

:: Check if virtual environment exists
if not exist venv\Scripts\activate.bat (
    echo ❌ Virtual environment not found. Please run setup.bat first.
    exit /b 1
)

:: Activate virtual environment
call venv\Scripts\activate

:: Set environment variables
set PYTHONPATH=.
set PORT=8000
set ENV=development

:: Start the FastAPI server with auto-reload
echo.
echo 🌐 Starting development server on http://localhost:%PORT%
echo 📚 API Documentation: http://localhost:%PORT%/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn working_server:app --host 0.0.0.0 --port %PORT% --reload

endlocal
