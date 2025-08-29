@echo off
echo Starting NoteFusion AI Frontend...
cd /d "%~dp0frontend"

:: Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Starting development server...
call npx vite --host 0.0.0.0 --port 3000

if %ERRORLEVEL% NEQ 0 (
    echo Failed to start development server
    pause
    exit /b 1
)
