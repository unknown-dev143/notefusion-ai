@echo off
echo Starting NoteFusion AI setup...
echo =============================

echo Step 1: Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found. Please install Node.js v22.18.0 or later from:
    echo https://nodejs.org/
    echo.
    echo Make sure to check "Add to PATH" during installation.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo Found Node.js %NODE_VERSION%

cd /d %~dp0frontend

echo.
echo Step 2: Installing dependencies...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 3: Starting development server...
start "" "http://localhost:3000"
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo Failed to start development server
    pause
    exit /b 1
)

echo.
echo ✅ Development server is running!
echo 🌐 Open http://localhost:3000 in your browser
echo.
pause
