@echo off
echo Starting FastAPI Verification Test...
echo ===================================
echo.

set PYTHONPATH=.
set PYTHONUNBUFFERED=1

python verify_fastapi.py

echo.
echo If you see no errors above, the server should be running.
echo Open your browser and go to: http://localhost:5000
echo.
pause
