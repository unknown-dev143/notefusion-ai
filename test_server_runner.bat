@echo off
echo Stopping any running Python processes...
taskkill /F /IM python.exe >nul 2>&1

echo Starting test server...
start "Test Server" cmd /k "cd /d %~dp0 && python test_api.py"

timeout /t 3 >nul

echo Testing server...
python -c "import requests; print('Server response:', requests.get('http://localhost:8000/').text)"

echo.
echo If you see a JSON response above, the server is running correctly.
echo You can access the API at: http://localhost:8000
echo API documentation: http://localhost:8000/docs

echo.
pause
