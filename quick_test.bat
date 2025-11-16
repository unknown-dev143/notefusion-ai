@echo off
echo Quick Test Script

echo Step 1: Basic echo
echo Hello, this is a test!

echo.
echo Step 2: Create and read a file
echo Test content > test_file.txt
type test_file.txt
del test_file.txt

echo.
echo Step 3: Check Python in virtual environment
call .\venv\Scripts\activate.bat
python --version

echo.
echo Step 4: Check Python path
where python

echo.
echo Step 5: Run a simple Python command
python -c "import sys; print(f'Python executable: {sys.executable}')"

pause
