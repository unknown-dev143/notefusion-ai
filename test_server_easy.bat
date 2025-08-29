@echo off
echo Stopping any running Python processes...
taskkill /F /IM python.exe >nul 2>&1

echo Starting simple HTTP server on port 8000...
start "Test Server" cmd /k "python -m http.server 8000"

timeout /t 2 >nul

echo Testing server...
curl http://localhost:8000/

echo.
echo If you see directory listing above, the server is working.
echo You can access it at: http://localhost:8000
echo.
pause
