@echo off
echo Starting NoteFusion AI Backend Server...
echo =====================================

:: Set Python path to include the current directory
set PYTHONPATH=%CD%

:: Activate virtual environment
call .venv\Scripts\activate

:: Start the FastAPI server
echo Starting server...
python -m uvicorn backend.app.main:app --reload

pause
