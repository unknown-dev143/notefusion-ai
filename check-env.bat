@echo off
echo === Environment Check ===

echo.
echo 1. Basic System Info:
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"

echo.
echo 2. Node.js Installation:
where node

if %ERRORLEVEL% EQU 0 (
    echo Node.js is installed at:
    where node
    echo.
    echo Node.js version:
    node --version
    echo.
    echo npm version:
    npm --version
) else (
    echo Node.js is not in the system PATH
)

echo.
echo 3. Environment Variables:
echo PATH contains Node.js: %PATH:node=%|find "node" >nul && echo Yes || echo No

echo.
echo 4. Running a simple Node.js test:
echo console.log('Node.js is working!') > test.js
node test.js
del test.js

echo.
echo === Environment Check Complete ===
pause
