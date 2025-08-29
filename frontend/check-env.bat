@echo off
echo === Environment Check ===
echo.

echo 1. Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH
    exit /b 1
) else (
    echo ✅ Node.js is installed
    node -v
)

echo.
echo 2. Checking npm installation...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed or not in PATH
) else (
    echo ✅ npm is installed
    npm -v
)

echo.
echo 3. Creating a test file...
echo console.log('Test successful!'); > test.js

node test.js
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to run test.js
    del test.js
    exit /b 1
)
del test.js

echo.
echo 4. Testing file system access...
echo Test content > test.txt
if %ERRORLEVEL% EQU 0 (
    echo ✅ Can write to current directory
    type test.txt
    del test.txt
) else (
    echo ❌ Cannot write to current directory
)

echo.
echo === Check Complete ===
pause
