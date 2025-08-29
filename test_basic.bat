@echo off
echo Testing basic command execution...
echo.

echo 1. Testing echo command...
echo This is a test
if %ERRORLEVEL% NEQ 0 echo ❌ Echo command failed

echo.
echo 2. Testing directory listing...
dir /b
if %ERRORLEVEL% NEQ 0 echo ❌ Directory listing failed

echo.
echo 3. Testing Python with full path...
"C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe" --version
if %ERRORLEVEL% NEQ 0 echo ❌ Python version check failed

echo.
echo 4. Running simple Python command...
echo print("Hello from Python") > test.py
"C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe" test.py
del test.py

echo.
echo 5. Checking Python path...
"C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe" -c "import sys; print('Python Path:'); [print(p) for p in sys.path]"

echo.
echo ===== Test Complete =====
pause
