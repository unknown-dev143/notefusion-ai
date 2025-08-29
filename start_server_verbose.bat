@echo off
echo Starting FastAPI Server with detailed logging...
echo.

set PYTHONPATH=.
set PYTHONUNBUFFERED=1

"C:\Program Files\Python312\python.exe" -c "
import sys
import os
import uvicorn

print('='*60)
print('FastAPI Server Starting...')
print('='*60)
print(f'Python: {sys.executable}')
print(f'Version: {sys.version}')
print(f'Working Directory: {os.getcwd()}')
print('\nEnvironment Variables:')
for key in ['PATH', 'PYTHONPATH', 'VIRTUAL_ENV']:
    print(f'  {key}: {os.environ.get(key, "Not set")}')

print('\n' + '='*60)
print('Starting FastAPI on port 8000...')
print('='*60)
print('Access the server at: http://localhost:8000')
print('Press Ctrl+C to stop the server')
print('='*60 + '\n')

uvicorn.run(
    'minimal_app:app',
    host='0.0.0.0',
    port=8000,
    reload=True,
    log_level='debug',
    access_log=True
)
"

pause
