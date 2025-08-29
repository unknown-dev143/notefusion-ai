@echo off
echo 🚀 Setting up NoteFusion AI Frontend...
echo ===================================

echo.
echo 🧹 Step 1/3: Cleaning up old dependencies...
if exist node_modules rmdir /s /q node_modules
del /f /q package-lock.json

echo.
echo 📦 Step 2/3: Installing dependencies...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🚀 Step 3/3: Starting development server...
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Failed to start development server
    pause
    exit /b 1
)

echo.
echo ✅ Setup complete! The app should open in your default browser shortly...
pause
