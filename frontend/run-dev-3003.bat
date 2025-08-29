@echo off
echo Starting development server on port 3003...
set NODE_OPTIONS=--max-old-space-size=4096
call npx vite --port 3003 --host --debug

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Failed to start Vite. Trying alternative method...
    call npx vite --port 3003 --host --force
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo All attempts failed. Please check the error messages above.
    pause
)
