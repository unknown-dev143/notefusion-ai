@echo off
echo Running Python test...
python -c "print('Hello from Python!')

if errorlevel 1 (
    echo Python command failed with error level %errorlevel%
    pause
    exit /b %errorlevel%
)

echo Running pytest...
python -m pytest tests/test_basic.py -v

if errorlevel 1 (
    echo Tests failed with error level %errorlevel%
    pause
    exit /b %errorlevel%
)

pause
