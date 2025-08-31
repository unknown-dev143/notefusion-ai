@echo off
echo === Node.js Environment Check ===
echo.

echo 1. Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] Node.js is installed at:
    where node
    echo.
    echo [✓] Node.js version:
    node -v
) else (
    echo [✗] Node.js is not found in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo 2. Checking npm installation...
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] npm is installed at:
    where npm
    echo.
    echo [✓] npm version:
    npm -v
) else (
    echo [✗] npm is not found in PATH.
    echo Please ensure npm is properly installed with Node.js.
    pause
    exit /b 1
)

echo.
echo 3. Checking Node.js environment...
set NODE_PATH
if "%NODE_PATH%"=="" (
    echo [ℹ] NODE_PATH environment variable is not set.
) else (
    echo [✓] NODE_PATH is set to: %NODE_PATH%
)

echo.
echo 4. Running a simple Node.js test...
echo console.log('Node.js is working!') > test-node.js
node test-node.js
if %ERRORLEVEL% EQU 0 (
    echo [✓] Node.js test completed successfully.
    del test-node.js
) else (
    echo [✗] Node.js test failed with error code %ERRORLEVEL%
)

echo.
pause
