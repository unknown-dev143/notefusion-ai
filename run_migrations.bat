@echo off
setlocal enabledelayedexpansion

:: Set Python executable path (modify if needed)
set PYTHON=python

:: Create a virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    %PYTHON% -m venv venv
    call venv\Scripts\activate.bat
    echo Installing dependencies...
    pip install -e .
) else (
    call venv\Scripts\activate.bat
)

echo Running database migrations...
%PYTHON% run_migrations.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database migrations completed successfully!
) else (
    echo.
    echo ❌ Error running database migrations!
)

pause
