@echo off
echo === Environment Verification ===
echo.

echo 1. Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not in your PATH.
    exit /b 1
) else (
    echo ✅ Node.js is installed
    node -v
)

echo.
echo 2. Checking npm installation...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not in your PATH.
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
echo 4. Checking directory permissions...
echo Test > test.txt
if %ERRORLEVEL% EQU 0 (
    echo ✅ Can write to current directory
    del test.txt
) else (
    echo ❌ Cannot write to current directory
)

echo.
echo 5. Running a simple Vitest check...
echo import { test, expect } from 'vitest' > test-vitest.js
echo "test('1 + 1 equals 2', () => { expect(1 + 1).toBe(2) })" >> test-vitest.js

npx vitest run test-vitest.js --reporter=verbose
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vitest test failed
    del test-vitest.js
    exit /b 1
)
del test-vitest.js

echo.
echo === Verification Complete ===
pause
