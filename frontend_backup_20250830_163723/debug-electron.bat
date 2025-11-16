@echo off
echo Starting Electron with debug information...
echo ===================================

echo.
echo [1/4] Checking Node.js and npm versions...
node -v
npm -v

echo.
echo [2/4] Checking Electron installation...
npm list electron --depth=0

echo.
echo [3/4] Running Electron with debug flags...
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1
set NODE_OPTIONS=--trace-warnings

npx electron electron-simple.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===================================
    echo Error: Electron failed to start
    echo ===================================
    echo.
    echo Try these troubleshooting steps:
    echo 1. Delete node_modules and run: npm install
    echo 2. Clear npm cache: npm cache clean --force
    echo 3. Reinstall Electron: npm install electron@latest --save-dev
    echo 4. Check for system requirements at: https://www.electronjs.org/docs/latest/tutorial/installation
) else (
    echo.
    echo ===================================
    echo Electron started successfully!
    echo ===================================
)

pause
