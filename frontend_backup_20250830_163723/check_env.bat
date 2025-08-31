@echo off
echo Environment Diagnostics:
echo =====================

echo.
echo 1. Checking Node.js Installation:
where node
node -v

echo.
echo 2. Checking npm Installation:
where npm
npm -v

echo.
echo 3. Checking System PATH:
echo %PATH%

echo.
echo 4. Running a simple Node.js test:
node -e "console.log('Node.js test successful')"

echo.
echo 5. Checking directory contents:
dir /b

pause
