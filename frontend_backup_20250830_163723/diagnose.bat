@echo off
echo === Environment Diagnosis ===
echo.
echo 1. Checking command processor...
echo Test output from batch file > test_output.txt
echo.

echo 2. Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ Node.js is installed
    node -v > node_version.txt 2>&1
    type node_version.txt
) else (
    echo ✗ Node.js is not found in PATH
)
echo.

echo 3. Checking directory contents...
dir /b > dir_listing.txt
type dir_listing.txt
echo.

echo 4. Creating a test file...
echo Test content > test_file.txt
if exist test_file.txt (
    echo ✓ Successfully created test_file.txt
) else (
    echo ✗ Failed to create test file
)
echo.

echo 5. Checking environment variables...
echo PATH=%PATH%
echo.

echo 6. Writing results to log...
echo Diagnosis complete at %DATE% %TIME% > diagnosis.log
echo Node.js version: >> diagnosis.log
type node_version.txt >> diagnosis.log 2>&1
echo. >> diagnosis.log
echo Directory listing: >> diagnosis.log
type dir_listing.txt >> diagnosis.log
echo. >> diagnosis.log
echo Environment variables: >> diagnosis.log
set >> diagnosis.log

echo ✓ Diagnosis complete. Check diagnosis.log for details.
pause
