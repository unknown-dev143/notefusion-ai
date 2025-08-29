@echo off
echo === Diagnosing Development Environment ===
echo.

echo 1. Checking Node.js and npm versions...
node -v
npm -v
echo.

echo 2. Checking for running Node.js processes...
tasklist | findstr node
echo.

echo 3. Checking port 3001...
netstat -ano | findstr :3001
echo.

echo 4. Stopping any running Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo.

echo 5. Installing dependencies...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies
    pause
    exit /b %ERRORLEVEL%
)
echo.

echo 6. Starting Vite development server on port 3001...
set NODE_OPTIONS=--max-old-space-size=4096
call npx vite --port 3001 --host

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Vite failed to start. Trying alternative port 4000...
    call npx vite --port 4000 --host
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo All attempts failed. Please check the error messages above.
    pause
)
