@echo off
echo ===== Simple System Test =====
echo.

echo 1. Basic command test...
echo Hello, this is a test!
echo.

echo 2. Creating test file...
echo Test content > test_output.txt
type test_output.txt
del test_output.txt
echo.

echo 3. Checking Python installation...
where python
where python3
where python.exe
where python3.exe
echo.

echo 4. Testing Python with full path...
"C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe" --version
echo.

echo 5. Checking virtual environment...
if exist ".venv\Scripts\python.exe" (
    echo Virtual environment found at .venv
    .venv\Scripts\python.exe --version
) else (
    echo Virtual environment not found
)

echo.
pause
