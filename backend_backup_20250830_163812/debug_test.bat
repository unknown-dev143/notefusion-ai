@echo off
echo Starting test execution...
echo.

echo === Python Environment ===
where python
python --version
echo.

echo === Running Simple Python Command ===
python -c "print('Hello from Python!'); import sys; print(f'Python Path: {sys.path}')"
echo.

echo === Checking Test File Exists ===
if exist tests\test_basic.py (
    echo Found test_basic.py
    type tests\test_basic.py
) else (
    echo test_basic.py not found
)
echo.

echo === Running Pytest with Debug ===
python -m pytest tests\test_basic.py -v --tb=short
echo Pytest exit code: %ERRORLEVEL%
echo.

pause
