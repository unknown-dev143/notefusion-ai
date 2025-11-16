@echo off
call venv\Scripts\activate
if errorlevel 1 (
    echo Failed to activate virtual environment. Run setup_env.bat first.
    pause
    exit /b 1
)

echo Starting NoteFusion AI server...
python -m uvicorn app.main:app --reload

if errorlevel 1 (
    echo Failed to start the server
    pause
)
