# Run NoteFusion AI in development mode

# Set error action preference
$ErrorActionPreference = "Stop"

# Activate virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "Virtual environment not found. Please run setup_dev_env.ps1 first." -ForegroundColor Red
    exit 1
}
.\venv\Scripts\Activate.ps1

# Start Redis server if not running (required for Celery)
try {
    $redisProcess = Get-Process redis-server -ErrorAction SilentlyContinue
    if (-not $redisProcess) {
        Write-Host "Starting Redis server..." -ForegroundColor Cyan
        Start-Process redis-server --service-start
    }
} catch {
    Write-Host "Redis is not installed or could not be started. Running without Celery support." -ForegroundColor Yellow
}

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python scripts/run_dev.py" -WindowStyle Normal

# Start frontend server
Write-Host "Starting frontend development server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Development servers started!" -ForegroundColor Green
Write-Host "- Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "- API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Cyan

# Keep the script running
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
