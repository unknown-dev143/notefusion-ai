@echo off
echo Starting NoteFusion AI...

:: Use full path to Python in virtual environment
venv\Scripts\python.exe minimal_app.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error running the application
    echo Please check the error message above
    pause
)
