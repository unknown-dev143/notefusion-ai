@echo off
setlocal enabledelayedexpansion

echo Starting FastAPI server...
start "FastAPI Server" cmd /k "cd /d %~dp0backend && .\venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 5 /nobreak >nul

echo Testing server...
curl http://localhost:8000/api/v1/ai/test/security

echo.
echo If you see a response above, the server is running correctly.
echo You can access the API documentation at: http://localhost:8000/docs
echo.
pause
