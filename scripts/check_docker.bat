@echo off
echo Checking if Docker is running...

docker --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Docker is installed and accessible
    
    echo.
echo Starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo Waiting for Docker to start...
timeout /t 30 /nobreak >nul

docker ps >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Docker is running and ready to use
    echo.
    echo Running containers:
    docker ps --format "table {{.Names}}	{{.Status}}"
) else (
    echo Docker is not responding. Please start Docker Desktop manually and try again.
    pause
    exit /b 1
)

exit /b 0
