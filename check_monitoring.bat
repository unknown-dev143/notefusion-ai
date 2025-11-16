@echo off
setlocal enabledelayedexpansion

echo ====================================
echo NoteFusion AI - Monitoring Status
echo ====================================
echo.

echo Checking Docker status...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    goto :end
)

echo.
echo Docker is installed. Checking if it's running...
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not running
    echo Please start Docker Desktop and try again
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo.
    echo Waiting for Docker to start...
    timeout /t 30 /nobreak >nul
    
    docker ps >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Docker is still not responding
        echo Please check Docker Desktop and try again
        goto :end
    )
)

echo.
echo ✅ Docker is running

echo.
echo ====================================
echo Monitoring Services Status:
echo ====================================
echo.

docker ps --format "table {{.Names}}	{{.Status}}" | findstr /i "prometheus grafana node-exporter cadvisor redis-exporter postgres-exporter"

echo.
echo ====================================
echo Access Information:
echo ====================================
echo.

echo 📊 Grafana:      http://localhost:3001
echo    - Username: admin
echo    - Password: admin123
echo.
echo 📈 Prometheus:   http://localhost:9090
echo 📊 cAdvisor:     http://localhost:8080
echo.

:end
echo.
pause
