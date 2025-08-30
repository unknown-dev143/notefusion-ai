@echo off
REM Run the backend server with proper permissions
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start_backend.ps1"
pause
