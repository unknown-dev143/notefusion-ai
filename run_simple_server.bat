@echo off
echo Starting Simple FastAPI Server...
echo.

set PYTHONPATH=.
set PYTHONUNBUFFERED=1

"C:\Program Files\Python312\python.exe" -c "
import sys
import os
print('='*60)
print('Python Environment Info')
print('='*60)
print(f'Python: {sys.executable}')
print(f'Version: {sys.version}')
print(f'Working Directory: {os.getcwd()}')
print('\nEnvironment Variables:')
for key in ['PATH', 'PYTHONPATH', 'VIRTUAL_ENV']:
    print(f'  {key}: {os.environ.get(key, "Not set")}')

print('\n' + '='*60)
print('Starting FastAPI Server...')
print('='*60)

import uvicorn
uvicorn.run('simple_server:app', host='0.0.0.0', port=8000, reload=True, log_level='debug')
"

pause
