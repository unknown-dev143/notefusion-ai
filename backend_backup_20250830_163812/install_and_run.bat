@echo off
echo Installing required packages...
call .venv\Scripts\activate.bat
pip install aiofiles
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install aiofiles. Please check your Python environment.
    pause
    exit /b 1
)
echo Starting server...
start_backend.bat
