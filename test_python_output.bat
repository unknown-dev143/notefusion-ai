@echo off
echo Testing Python output...
echo.

echo 1. Testing Python with explicit output...
"C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe" -c "import sys; sys.stdout.write('This is a test\n'); sys.stdout.flush()" > test_output.txt 2>&1
type test_output.txt
del test_output.txt

echo.
echo 2. Testing Python with -u flag...
"C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe" -u -c "import sys; print('Unbuffered output test'); sys.stdout.flush()" > test_output.txt 2>&1
type test_output.txt
del test_output.txt

echo.
echo 3. Checking environment variables...
echo PYTHONPATH=%PYTHONPATH%
echo PYTHONHOME=%PYTHONHOME%

echo.
echo 4. Running a simple Python script with output redirection...
echo print("Hello from Python script") > test_script.py
"C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe" -u test_script.py > test_output.txt 2>&1
type test_output.txt
del test_script.py
del test_output.txt

echo.
echo ===== Test Complete =====
pause
