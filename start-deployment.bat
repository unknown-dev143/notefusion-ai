@echo off
echo ====================================
echo NoteFusion AI - Deployment Script
echo ====================================
echo.

echo [1/4] Checking Docker status...
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [2/4] Pulling latest Docker images...
docker-compose pull

if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to pull Docker images.
    pause
    exit /b 1
)

echo [3/4] Starting services...
docker-compose up -d --build

if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to start services.
    pause
    exit /b 1
)

echo [4/4] Deployment completed successfully!
echo.
echo ====================================
echo Application URLs:
echo ====================================
echo Frontend:    http://localhost:3000
echo Backend:     http://localhost:8000
echo Database:    http://localhost:8080 (pgAdmin)
echo Monitoring:  http://localhost:3001 (Grafana)
echo Prometheus:  http://localhost:9090
echo.
echo ====================================
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
echo ====================================
echo.
pause
