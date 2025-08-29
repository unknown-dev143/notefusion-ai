@echo off
echo === Node.js Environment Checker ===
echo.

echo 1. Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not in your PATH
    exit /b 1
) else (
    echo [✓] Node.js is installed
)

echo.
echo 2. Checking Node.js version...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to get Node.js version
) else (
    echo [✓] Node.js version: 
    node -v
)

echo.
echo 3. Checking npm...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not in your PATH
) else (
    echo [✓] npm is installed
    echo     npm version: 
    npm -v
)

echo.
echo 4. Checking environment variables...
echo    NODE_PATH: %NODE_PATH%
echo    NVM_HOME: %NVM_HOME%

echo.
echo 5. Running a simple test...
echo console.log('Test successful! Date:', new Date().toISOString()) > test-node-env.js
node test-node-env.js
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js test failed
) else (
    echo [✓] Node.js test completed successfully
)
del test-node-env.js >nul 2>&1

echo.
pause
