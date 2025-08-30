@echo off
echo Testing Node.js installation...
echo =============================
echo.

:: Create a simple test file
echo console.log('Node.js test successful!'); > test.js
echo console.log('Node.js version:', process.version); >> test.js
echo console.log('Platform:', process.platform); >> test.js
echo console.log('Architecture:', process.arch); >> test.js

:: Run the test file
node test.js

:: Clean up
del test.js

echo.
echo =============================
echo Test complete. Press any key to exit...
pause >nul
