@echo off
echo Running Python environment test...
echo.

REM Try to run the test script with python
echo Attempting to run with 'python test_python.py'...
python test_python.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo "Failed to run with 'python'. Trying with 'py'..."
    py test_python.py
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo "Both 'python' and 'py' commands failed. Please check your Python installation."
        pause
        exit /b 1
    )
)

echo.
echo Test completed. Check the output above for any issues.
pause
