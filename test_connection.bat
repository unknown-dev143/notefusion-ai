@echo off
echo Checking if port 8000 is in use...
netstat -ano | findstr :8000
if %ERRORLEVEL% EQU 0 (
    echo Port 8000 is in use.
    echo Killing processes on port 8000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a
)

echo Starting test server...
start "Test Server" cmd /k "python -m http.server 8000"

timeout /t 2 >nul

echo Testing connection...
curl -v http://localhost:8000/

echo.
echo If you see a directory listing above, the server is working.
echo You can access it at: http://localhost:8000
echo.
pause
