@echo off
set PYTHONPATH=.
set PYTHONUNBUFFERED=1

echo Starting simple FastAPI test...
python test_fastapi_simple.py

echo.
echo If you see no errors above, the server should be running.
echo Open your browser and go to: http://localhost:5000
echo.
pause
