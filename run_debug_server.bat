@echo off
set PYTHONUNBUFFERED=1
set PYTHONPATH=.

"C:\Program Files\Python312\python.exe" -u debug_server.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===== ERROR =====
    echo The server failed to start. Here are some things to check:
    echo 1. Make sure Python 3.12.7 is installed correctly
    echo 2. Check if another process is using the port
    echo 3. Try running as administrator
    echo 4. Check Windows Event Viewer for Python errors
)

pause
