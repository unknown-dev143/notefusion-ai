@echo off
setlocal enabledelayedexpansion

echo ===== Direct Environment Test =====
echo.

echo 1. Creating test file...
echo Test content > test_output.txt

echo 2. Verifying file creation...
if exist test_output.txt (
    echo File created successfully
    type test_output.txt
    del test_output.txt
) else (
    echo Failed to create test file
)

echo.
echo 3. Testing Python directly...
"C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe" -c "import sys; print('Python test successful')" > py_test.txt 2>&1
if exist py_test.txt (
    type py_test.txt
    del py_test.txt
) else (
    echo Python test failed
)

echo.
echo 4. Testing Python in virtual environment...
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe -c "import sys; print('Virtual environment Python test successful')" > venv_test.txt 2>&1
    if exist venv_test.txt (
        type venv_test.txt
        del venv_test.txt
    ) else (
        echo Virtual environment Python test failed
    
) else (
    echo Virtual environment not found
)

echo.
pause
