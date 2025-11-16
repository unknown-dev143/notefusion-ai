@echo off
call .\venv_clean\Scripts\activate
python -m uvicorn minimal_main:app --reload --host 127.0.0.1 --port 8000
pause
