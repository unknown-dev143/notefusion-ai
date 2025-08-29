@echo off
setlocal

echo ===== Environment Information =====
where python
where uvicorn

echo.
echo ===== Python Version =====
python --version

echo.
echo ===== Starting FastAPI Server =====
python -c "import uvicorn; uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True, log_level='debug')"

pause
