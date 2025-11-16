@echo off
echo 🚀 Starting Quick Deployment...
echo.

:: Go to frontend directory
cd /d %~dp0frontend

:: Install dependencies
echo 📦 Installing dependencies...
call npm install --legacy-peer-deps --force
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Warning: Some dependencies had issues but we'll continue...
)

:: Build the application
echo.
echo 🔨 Building application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Build failed
    pause
    exit /b 1
)

echo.
echo 🚀 Starting development server...
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Failed to start development server
    pause
    exit /b 1
)

echo.
echo ✅ Development server is running!
echo 🌐 Open http://localhost:3000 in your browser
echo.
pause
