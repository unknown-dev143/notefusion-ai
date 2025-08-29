@echo off
echo Stopping any running Python processes...
taskkill /F /IM python.exe >nul 2>&1

echo Starting HTTP server...
start "Test Server" cmd /k "title Test Server && python -m http.server 8000"

timeout /t 2 >nul

start http://localhost:8000/test_page.html

echo.
echo A browser window should open with the test page.
echo If you see the test page, the server is working correctly.
echo.
pause
