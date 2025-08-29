@echo off
echo Starting FastAPI with detailed logging...
echo.

set PYTHONPATH=.
set PYTHONUNBUFFERED=1
set UVICORN_LOG_LEVEL=debug

"C:\Program Files\Python312\python.exe" -c "
import os
import sys
import uvicorn

print('='*50)
print('Environment Information')
print('='*50)
print(f'Python Executable: {sys.executable}')
print(f'Python Version: {sys.version}')
print(f'Working Directory: {os.getcwd()}')
print('\nEnvironment Variables:')
for key in ['PATH', 'PYTHONPATH', 'VIRTUAL_ENV']:
    print(f'  {key}: {os.environ.get(key, "Not set")}')

print('\n' + '='*50)
print('Dependency Check')
print('='*50)
try:
    import fastapi
    print(f'FastAPI version: {fastapi.__version__}')
    import uvicorn
    print(f'Uvicorn version: {uvicorn.__version__}')
    import sqlalchemy
    print(f'SQLAlchemy version: {sqlalchemy.__version__}')
except ImportError as e:
    print(f'Error importing dependencies: {e}')
    print('\nPlease install the required packages using:')
    print('pip install -r requirements.txt')
    input('Press Enter to exit...')
    sys.exit(1)

print('\n' + '='*50)
print('Starting FastAPI Server')
print('='*50)
print('Server will be available at: http://localhost:5000')
print('Press Ctrl+C to stop the server')
print('='*50 + '\n')

uvicorn.run(
    'minimal_test:app',
    host='0.0.0.0',
    port=5000,
    reload=True,
    log_level='debug',
    access_log=True
)
"

pause
