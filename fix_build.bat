@echo off
echo Cleaning up frontend dependencies...
cd frontend
call npm cache clean --force
rmdir /s /q node_modules
del package-lock.json

echo Installing dependencies...
call npm install --legacy-peer-deps

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies. Please check the error above.
    exit /b 1
)

echo Building frontend...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed. Please check the error above.
    exit /b 1
)

echo Build completed successfully!
pause
