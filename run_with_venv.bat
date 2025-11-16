@echo off
setlocal enabledelayedexpansion

echo ===== Running with Virtual Environment =====
echo.

:: Set the path to the virtual environment Python
set PYTHON_PATH=%~dp0.venv\Scripts\python.exe

:: Check if Python exists in the virtual environment
if not exist "%PYTHON_PATH%" (
    echo Error: Python not found in virtual environment at:
    echo %PYTHON_PATH%
    echo.
    echo Please run setup_and_run.bat first to set up the environment.
    pause
    exit /b 1
)

echo Using Python at: %PYTHON_PATH%
echo.

:: Run the application
echo Starting NoteFusion AI...
"%PYTHON_PATH%" "%~dp0minimal_app.py"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Application failed to start (Error: !ERRORLEVEL!)
    echo.
    pause
) else (
    echo.
    echo Application exited successfully
)

echo.
pause
