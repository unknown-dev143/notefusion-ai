@echo off
echo === Node.js Environment Verification ===
echo.

echo 1. Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not in your PATH.
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

echo.
echo 2. Checking Node.js version...
node -v
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to get Node.js version
    exit /b 1
)

echo.
echo 3. Checking npm version...
npm -v
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to get npm version
    exit /b 1
)

echo.
echo 4. Creating a test file...
echo console.log('Test successful!'); > test.js

node test.js
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to run test.js
    del test.js
    exit /b 1
)
del test.js

echo.
echo 5. Checking directory permissions...
echo Test > test.txt
if %ERRORLEVEL% EQU 0 (
    echo ✅ Can write to current directory
    del test.txt
) else (
    echo ❌ Cannot write to current directory
)

echo.
echo === Verification Complete ===
pause
