@echo off
echo === Environment Diagnosis ===
echo.

echo 1. Checking Python installation...
where python
where python3
py --version
python --version
python3 --version

echo.
echo 2. Checking Python path...
python -c "import sys; print('\n'.join(sys.path))"

echo.
echo 3. Checking directory permissions...
icacls .

echo.
echo 4. Running a simple Python command...
python -c "print('Hello from Python!')"

echo.
echo 5. Creating a test file...
echo print('Test file executed successfully!') > test_script.py
python test_script.py
del test_script.py

echo.
echo === Diagnosis Complete ===
pause
