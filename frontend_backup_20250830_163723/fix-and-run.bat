@echo off
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Checking Node.js and npm versions...
node -v
npm -v

echo.
echo Installing dependencies...
call npm install --legacy-peer-deps

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Starting Vite development server on port 3002...
set NODE_OPTIONS=--max-old-space-size=4096
call npx vite --port 3002 --host

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Vite failed to start. Trying alternative method...
    call npx vite --debug
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo All attempts failed. Please check the error messages above.
    pause
)
