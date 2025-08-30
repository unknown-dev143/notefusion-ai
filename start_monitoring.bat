@echo off
echo Starting NoteFusion AI Monitoring Stack...
echo ====================================

echo.
echo 1. Checking Docker...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo.
echo 2. Starting Docker Desktop if not running...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo Waiting for Docker to initialize...
timeout /t 30 /nobreak >nul

echo.
echo 3. Starting monitoring services...
docker-compose -f docker-compose.yml up -d prometheus grafana node-exporter cadvisor redis-exporter postgres-exporter

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Failed to start monitoring services
    echo Please check if Docker is running and try again
    pause
    exit /b 1
)

echo.
echo 4. Verifying services...
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
docker ps --format "table {{.Names}}\t{{.Status}}"

echo.
echo ====================================
echo Monitoring Stack Started Successfully!
echo ====================================
echo.
echo Access the monitoring tools at:
echo.
echo 📊 Grafana:      http://localhost:3001
echo    - Username: admin
echo    - Password: admin123
echo.
echo 📈 Prometheus:   http://localhost:9090
echo 📊 cAdvisor:     http://localhost:8080
echo.
echo ====================================
echo.
pause
