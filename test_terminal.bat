@echo off
echo ===== Terminal Test =====
echo.

echo 1. Testing basic output...
echo Hello, this is a test!

echo.
echo 2. Creating a test file...
echo Test content > test_terminal.txt
if exist test_terminal.txt (
    echo Successfully created test_terminal.txt
    type test_terminal.txt
    del test_terminal.txt
) else (
    echo Failed to create test file
)

echo.
echo 3. Testing command chaining...
whoami & echo. & date /t & time /t

echo.
echo 4. Testing error output...
ver
if %ERRORLEVEL% NEQ 0 echo Command failed with error level %ERRORLEVEL%

pause
