@echo off
echo Testing Node.js installation...
node --version

echo.
echo Testing npm installation...
npm --version

echo.
echo Listing test files...
dir /s /b src\**\__tests__\*.test.*

echo.
echo Running simple test with full path...
node --experimental-vm-modules node_modules/.bin/vitest run __tests__\simple.test.ts

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Test failed, checking Vitest installation...
    npm list vitest
)

echo.
echo Test script completed.
