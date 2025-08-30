@echo off
echo Testing Node.js environment...
echo.

:: Check Node.js version
node -v
echo.

:: Check npm version
npm -v
echo.

:: Simple JavaScript test
echo console.log('Hello from Node.js!'); > test.js
node test.js
del test.js
echo.

echo Environment test completed.
pause
