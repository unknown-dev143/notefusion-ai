@echo off
echo Setting up Node.js and starting NoteFusion AI...
echo ============================================

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed.
    echo.
    echo Please install Node.js v22.18.0 or later from:
    echo https://nodejs.org/
    echo.
    echo Make sure to check "Add to PATH" during installation.
    pause
    exit /b 1
)

:: Check Node.js version
for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
if "%NODE_VERSION%" LSS "v22.0.0" (
    echo Current Node.js version is %NODE_VERSION%. Please upgrade to v22.18.0 or later.
    pause
    exit /b 1
)

echo ✅ Using Node.js %NODE_VERSION%

:: Go to frontend directory
cd /d %~dp0frontend

:: Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

:: Start development server
echo.
echo 🚀 Starting development server...
start "" "http://localhost:3000"
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to start development server
    pause
    exit /b 1
)

echo.
echo ✅ Development server is running!
echo 🌐 Open http://localhost:3000 in your browser
echo.
pause
