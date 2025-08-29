@echo off
echo ===== Debugging Python Environment =====
echo.

:: Check Python version
python --version
echo.

:: Check Python path
where python
echo.

:: Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
) else (
    echo Virtual environment already exists.
)
echo.

:: Activate virtual environment
call venv\Scripts\activate
echo.

:: Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
echo.

:: Run the debug script
echo Running debug script...
python debug_backend.py

:: Keep the window open
pause
