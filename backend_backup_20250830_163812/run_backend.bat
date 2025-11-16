@echo off
echo ===== Python Environment Check =====
where python
where pip

echo.
echo ===== Python Version =====
python --version

echo.
echo ===== PIP List =====
pip list

echo.
echo ===== Starting FastAPI Server =====
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
