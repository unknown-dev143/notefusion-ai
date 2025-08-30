@echo off
echo Setting up environment...
set NODE_OPTIONS=--max-old-space-size=4096

echo Starting Vite development server...
npx vite --host --port 3001

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Failed to start Vite server. Trying alternative method...
    npx vite --debug
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo All attempts failed. Please check the error messages above.
    pause
)
