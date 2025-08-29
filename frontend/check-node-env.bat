@echo off
echo Checking Node.js installation...
echo.

where node
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not in your PATH.
    exit /b 1
)

echo.
echo Node.js version:
node --version
if %ERRORLEVEL% NEQ 0 (
    echo Failed to get Node.js version.
    exit /b 1
)

echo.
echo npm version:
npm --version
if %ERRORLEVEL% NEQ 0 (
    echo Failed to get npm version.
    exit /b 1
)

echo.
echo Current directory: %CD%
echo.

echo Creating a test file...
echo console.log('Test successful!'); > test.js

node test.js
if %ERRORLEVEL% NEQ 0 (
    echo Failed to run test.js
    del test.js
    exit /b 1
)

del test.js
echo.
echo Node.js environment check completed successfully.
pause
