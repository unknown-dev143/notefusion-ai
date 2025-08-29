@echo off
echo =============================================
echo NoteFusion AI - Deployment Assistant
echo =============================================

echo.
echo [1/5] Checking system requirements...
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [2/5] Verifying Docker is running...
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker daemon is not running.
    echo Please start Docker Desktop and ensure it's running, then try again.
    pause
    exit /b 1
)

echo [3/5] Checking environment configuration...
if not exist ".env" (
    echo [WARNING] No .env file found. Creating a default one...
    copy /Y ".env.example" ".env" >nul
    echo Please edit the .env file with your configuration.
    pause
)

echo [4/5] Starting services with Docker Compose...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start services with Docker Compose.
    echo Please check the error message above for details.
    pause
    exit /b 1
)

echo [5/5] Starting frontend development server...
start "" cmd /k "cd frontend && npm run dev"

echo.
echo =============================================
echo Deployment completed!
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo.
echo Press any key to exit...
pause >nul
