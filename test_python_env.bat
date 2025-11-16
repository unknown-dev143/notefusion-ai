@echo off
echo Testing Python Environment...
echo ============================
echo.

echo 1. Python Version:
python --version
echo.

echo 2. Python Executable:
python -c "import sys; print(sys.executable)"
echo.

echo 3. Python Path:
python -c "import sys; print('\n'.join(sys.path))"
echo.

echo 4. Testing simple Python script...
python -c "print('Hello from Python!'); import sys; print(f'Python version: {sys.version}'); print('Test successful!')"
echo.

echo 5. Checking for FastAPI and Uvicorn:
python -c "try: import fastapi; print(f'FastAPI version: {fastapi.__version__}'); import uvicorn; print(f'Uvicorn version: {uvicorn.__version__}'); print('Dependencies are installed!'); except ImportError as e: print(f'Error: {e}')"
echo.

echo 6. Checking port 5000...
python -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_STREAM); result = s.connect_ex(('127.0.0.1', 5000)); print('Port 5000 is ' + ('available' if result != 0 else 'in use')); s.close()"
echo.

echo 7. Checking port 8000...
python -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_STREAM); result = s.connect_ex(('127.0.0.1', 8000)); print('Port 8000 is ' + ('available' if result != 0 else 'in use')); s.close()"
echo.

echo 8. Checking port 8080...
python -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_STREAM); result = s.connect_ex(('127.0.0.1', 8080)); print('Port 8080 is ' + ('available' if result != 0 else 'in use')); s.close()"
echo.

echo Test complete. Check for any errors above.
pause
