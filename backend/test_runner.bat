@echo off
echo Starting NoteFusion AI tests...
echo.

REM Set Python path
set PYTHONPATH=.

REM Run the test script
echo Running tests...
python test_notes.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo All tests passed successfully!
) else (
    echo.
    echo Some tests failed. Please check the output above for details.
)

echo.
pause
