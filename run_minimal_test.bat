@echo off
echo Starting Minimal FastAPI Test...
echo.

set PYTHONPATH=.
set PYTHONUNBUFFERED=1

"C:\Program Files\Python312\python.exe" -c "
import os
print('Python version:')
import sys
print(sys.version)
print('\nCurrent directory:', os.getcwd())
print('\nEnvironment variables:')
for key in ['PATH', 'PYTHONPATH', 'VIRTUAL_ENV']:
    print(f'{key}: {os.environ.get(key, "Not set")}')

print('\nTrying to import FastAPI and Uvicorn...')
try:
    import fastapi
    import uvicorn
    print('Successfully imported FastAPI and Uvicorn')
    print(f'FastAPI version: {fastapi.__version__}')
    print(f'Uvicorn version: {uvicorn.__version__}')
    print('\nStarting server... (Press Ctrl+C to stop)')
    uvicorn.run('minimal_test:app', host='0.0.0.0', port=5000, reload=True, log_level='info')
except ImportError as e:
    print(f'Error importing required packages: {e}')
    print('\nPlease install the required packages using:')
    print('pip install fastapi uvicorn')
"

pause
