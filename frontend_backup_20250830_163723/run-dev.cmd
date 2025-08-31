@echo off
setlocal

echo Starting development server...
echo.
echo Node.js version:
node -v
echo.
echo NPM version:
npm -v
echo.
echo Current directory:
cd
echo.

echo Installing dependencies...
call npm install --legacy-peer-deps

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    exit /b %ERRORLEVEL%
)

echo.
echo Starting Vite...
set NODE_OPTIONS=--max-old-space-size=4096
call npx vite --host --port 3001 --debug

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

endlocal
