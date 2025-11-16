@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Node.js Environment Verification
echo ===================================
echo.

echo [1/4] Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH
    exit /b 1
)

echo [2/4] Node.js version:
node -v

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error getting Node.js version
    exit /b 1
)

echo [3/4] npm version:
npm -v

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error getting npm version
    exit /b 1
)

echo [4/4] Creating test file...
echo console.log('Test successful!'); > test.js
node test.js

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js environment is working correctly!
) else (
    echo ❌ Node.js test failed
)

del test.js >nul 2>&1

pause
