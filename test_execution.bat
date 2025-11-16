@echo off
echo Testing Python execution...
python -c "print('Python is working!')"
if %ERRORLEVEL% EQU 0 (
    echo Python executed successfully!
) else (
    echo Python execution failed.
)
pause
