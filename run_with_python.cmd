@echo off
REM This script will help run Python with the full path

echo Searching for Python...
where python > python_path.txt 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python not found in PATH.
    echo Please ensure Python is installed and added to your system PATH.
    pause
    exit /b 1
)

echo Python found. Attempting to run check_python.py...
python check_python.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo =========================================
    echo Python script failed. Trying with full path...
    echo =========================================
    
    for /f "tokens=*" %%i in ('where python') do (
        echo Trying Python at: %%i
        "%%i" check_python.py
        if %ERRORLEVEL% EQU 0 exit /b 0
    )
    
    echo.
    echo =========================================
    echo All Python attempts failed.
    echo Please check your Python installation.
    echo =========================================
)

pause
