@echo off
echo 🔍 Checking Node.js installation...

:: Check common Node.js installation paths
set NODE_PATHS=(
  "C:\Program Files\nodejs\node.exe"
  "C:\Program Files (x86)\nodejs\node.exe"
  "%APPDATA%\nvm\v22.18.0\node.exe"
  "%LOCALAPPDATA%\nvm\v22.18.0\node.exe"
  "%NVM_HOME%\v22.18.0\node.exe"
)

set FOUND=0
for %%i in (%NODE_PATHS%) do (
  if exist "%%i" (
    echo ✅ Found Node.js at: %%i
    set FOUND=1
    set NODE_PATH=%%i
    goto :NODE_FOUND
  )
)

if %FOUND%==0 (
  echo ❌ Node.js not found in common locations
  echo.
  echo Please install Node.js v22.18.0 or later from:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

:NODE_FOUND
echo.
echo 🔄 Adding Node.js to PATH temporarily...
set PATH=%~dp0\node_modules\.bin;%PATH%

:: Verify Node.js version
echo.
echo 📊 Node.js version:
"%NODE_PATH%" -v

:: Install dependencies
echo.
echo 📦 Installing dependencies...
cd /d %~dp0frontend
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Failed to install dependencies
  pause
  exit /b 1
)

:: Start development server
echo.
echo 🚀 Starting development server...
call npm run dev

if %ERRORLEVEL% NEQ 0 (
  echo ❌ Failed to start development server
  pause
  exit /b 1
)

echo.
echo ✅ Development server started successfully!
echo 🌐 Open http://localhost:3000 in your browser
echo.
pause
