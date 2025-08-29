@echo off
echo Updating TypeScript configurations...
echo.

:: Create temp directories if they don't exist
if not exist "temp-app" mkdir temp-app
if not exist "temp-vite" mkdir temp-vite

:: Run the Node.js script
node fix-tsconfig.js

echo.
echo If you see any errors above, please make sure Node.js is installed.
pause
