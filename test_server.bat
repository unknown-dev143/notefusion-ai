@echo off
echo Starting FastAPI server in the background...
start "FastAPI Server" cmd /k "python minimal_app.py"

echo Waiting for server to start...
timeout /t 5 >nul

echo Testing server endpoint...
python test_endpoint.py

echo.
echo If you see a successful response above, the server is running correctly.
echo You can access the API at: http://localhost:5000
echo API documentation is available at: http://localhost:5000/api/docs

echo.
pause
