@echo off
echo Checking Docker Desktop status...

echo.
echo 1. Starting Docker Desktop if not running...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo Waiting for Docker to start...
timeout /t 30 /nobreak >nul

echo.
echo 2. Verifying Docker is running...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not responding. Please start Docker Desktop manually and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Docker is running

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
echo 4. Checking service status...
docker ps --format "table {{.Names}}	{{.Status}}	{{.Ports}}"

echo.
echo ====================================
echo Monitoring Services Status:
echo ====================================
echo.
echo 📊 Grafana:      http://localhost:3001
echo    - Username: admin
echo    - Password: admin123
echo.
echo 📈 Prometheus:   http://localhost:9090
echo 📊 cAdvisor:     http://localhost:8080
echo.
pause
