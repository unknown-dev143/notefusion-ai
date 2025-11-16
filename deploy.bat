@echo off
echo 🚀 Starting NoteFusion AI Deployment...
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ Node.js is installed

:: Go to frontend directory
cd /d %~dp0frontend

:: Clean up
echo.
echo 🧹 Cleaning up previous build...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

:: Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install -g prisma
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
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
echo ✅ Build completed successfully!
echo.

echo 🚀 Deploying to Vercel...
call vercel --prod
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Deployment failed
    pause
    exit /b 1
)

echo.
echo ✅ Deployment completed successfully!
pause
