# Run NoteFusion AI in production mode

# Set error action preference
$ErrorActionPreference = "Stop"

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "This script requires administrator privileges to start Redis and other services." -ForegroundColor Red
    Write-Host "Please run this script as an administrator." -ForegroundColor Yellow
    exit 1
}

# Set environment to production
$env:ENV = "production"

# Start Redis server
try {
    $redisProcess = Get-Process redis-server -ErrorAction SilentlyContinue
    if (-not $redisProcess) {
        Write-Host "Starting Redis server..." -ForegroundColor Cyan
        Start-Process redis-server --service-start
    }
} catch {
    Write-Host "Redis is not installed or could not be started. Please install Redis and try again." -ForegroundColor Red
    exit 1
}

# Activate virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "Virtual environment not found. Please run setup_dev_env.ps1 first." -ForegroundColor Red
    exit 1
}
.\venv\Scripts\Activate.ps1

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Cyan
Set-Location frontend
npm run build

# Start backend services
Write-Host "Starting backend services..." -ForegroundColor Cyan
Set-Location ..\backend

# Start Celery worker
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python scripts/run_worker.py" -WindowStyle Normal

# Start Celery beat
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python scripts/run_beat.py" -WindowStyle Normal

# Start Gunicorn server
$gunicornCmd = "gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000"
Write-Host "Starting Gunicorn server: $gunicornCmd" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$gunicornCmd" -WindowStyle Normal

Write-Host ""
Write-Host "Production services started!" -ForegroundColor Green
Write-Host "- Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "- API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "- Static files: http://localhost:8000/static" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Cyan

# Keep the script running
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
