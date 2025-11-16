@echo off
echo 🚀 Starting Vite development server...

:: Navigate to frontend directory
cd /d %~dp0frontend

:: Run Vite directly
npx vite

if %ERRORLEVEL% NEQ 0 (
  echo ❌ Failed to start Vite development server
  pause
  exit /b 1
)

echo.
echo ✅ Vite development server started successfully!
echo 🌐 Open http://localhost:5173 in your browser
echo.
pause
