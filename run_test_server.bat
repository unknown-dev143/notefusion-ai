@echo off
echo Starting FastAPI Test Server...
echo.

set PYTHONPATH=.
set PYTHONUNBUFFERED=1

"C:\Program Files\Python312\python.exe" -c "
import sys
import os
print('='*50)
print('Python Environment Info')
print('='*50)
print(f'Python: {sys.executable}')
print(f'Version: {sys.version}')
print(f'Working Directory: {os.getcwd()}')

print('\nStarting FastAPI test server...')
print('Server will be available at: http://localhost:5000')
print('Press Ctrl+C to stop the server')
print('='*50 + '\n')

from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get('/')
async def root():
    return {'message': 'FastAPI test server is working!'}

uvicorn.run(app, host='0.0.0.0', port=5000, log_level='info')
"

pause
