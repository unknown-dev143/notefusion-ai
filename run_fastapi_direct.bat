@echo off
set PYTHONPATH=.
set PYTHONUNBUFFERED=1
python -m uvicorn minimal_app:app --host 0.0.0.0 --port 5000 --reload
pause
