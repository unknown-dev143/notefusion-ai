@echo off
echo Running test and saving output to test-output.txt...
node test-env-check.js > test-output.txt 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Test completed successfully.
    type test-output.txt
) else (
    echo Test failed with error code %ERRORLEVEL%
    type test-output.txt
)
pause
