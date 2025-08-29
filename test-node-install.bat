@echo off
echo Testing Node.js installation...
echo =============================

echo.
echo 1. Checking if Node.js is in PATH...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js is in PATH
    echo Node.js version: 
    node -v
) else (
    echo ❌ Node.js is not in PATH
)

echo.
echo 2. Checking common Node.js installation locations...
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
    echo    Version: 
    "%%i" -v
    set FOUND=1
  )
)

if %FOUND%==0 (
  echo ❌ Node.js not found in common locations
)

echo.
echo 3. Checking environment variables...
echo PATH contains Node.js: %PATH:node=%
if not "%PATH:node=%"=="%PATH%" (
  echo ✅ Node.js found in PATH
) else (
  echo ❌ Node.js not found in PATH
)

echo.
echo 4. Checking npm...
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ npm is in PATH
    echo npm version: 
    npm -v
) else (
    echo ❌ npm is not in PATH
)

echo.
pause
