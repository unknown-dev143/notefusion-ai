@echo off
echo Checking Node.js installation...
echo =============================

echo 1. Checking if Node.js is in PATH...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js is in PATH
    echo Node.js version:
    node -v
    echo.
    echo npm version:
    npm -v
) else (
    echo ❌ Node.js is not in PATH
)

echo.
echo 2. Checking common installation locations...

set "NODE_PATHS=(
  "C:\\Program Files\\nodejs\\node.exe"
  "C:\\Program Files (x86)\\nodejs\\node.exe"
  "%APPDATA%\\nvm\\v22.18.0\\node.exe"
  "%LOCALAPPDATA%\\nvm\\v22.18.0\\node.exe"
  "%USERPROFILE%\\AppData\\Local\\Programs\\nodejs\\node.exe"
)"

set FOUND=0
for %%i in (%NODE_PATHS%) do (
  if exist "%%i" (
    echo ✅ Found Node.js at: %%i
    "%%i" -v
    set FOUND=1
  )
)

if %FOUND%==0 (
  echo ❌ Node.js not found in common locations
)

echo.
pause
