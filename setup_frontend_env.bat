@echo off
echo Setting up frontend environment...
echo.

cd frontend

echo Creating .env.development file...
echo # Environment Configuration > .env.development
echo USE_MOCKS=true >> .env.development
echo VITE_API_URL=http://localhost:8000 >> .env.development
echo VITE_ENV=development >> .env.development
echo.

echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting development server...
start "" "cmd" /c "npm run dev"

echo.
echo Frontend should now be starting...
echo If it doesn't open automatically, go to: http://localhost:3000
echo.
pause
