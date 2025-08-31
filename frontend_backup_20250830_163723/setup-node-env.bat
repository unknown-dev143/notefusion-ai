@echo off
echo === Node.js Environment Setup ===
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [✗] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] Node.js is installed

:: Set Node.js paths
set NVM_HOME=C:\nvm4w
set NVM_SYMLINK=C:\Program Files\nodejs
set PATH=%NVM_HOME%;%NVM_SYMLINK%;%PATH%

echo.
echo [ℹ] Updated PATH to include Node.js

echo.
echo [ℹ] Verifying installation...
node -v
if %ERRORLEVEL% NEQ 0 (
    echo [✗] Failed to verify Node.js installation
    pause
    exit /b 1
)

npm -v
if %ERRORLEVEL% NEQ 0 (
    echo [✗] Failed to verify npm installation
    pause
    exit /b 1
)

echo.
echo [✓] Node.js environment is ready!

:: Install project dependencies
echo.
echo [ℹ] Installing project dependencies...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo [✗] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [✓] Setup completed successfully!
pause
