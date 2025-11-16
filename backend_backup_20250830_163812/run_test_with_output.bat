@echo off

echo ===== Starting Test Execution =====
echo.
echo Python Environment:
python --version
echo.

echo ===== Running Basic Test =====
python -c "print('\n=== Python is working! ===')"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python command failed with error level %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo.
echo ===== Running Pytest =====
python -m pytest tests/test_basic.py -v
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Tests failed with error level %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ All tests completed successfully!
pause
