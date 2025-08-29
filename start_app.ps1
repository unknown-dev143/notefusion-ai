Write-Host "Starting NoteFusion AI Deployment..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path .\.env)) {
    Write-Host "Error: .env file not found. Please create it from .env.example" -ForegroundColor Red
    exit 1
}

# Start Docker services
Write-Host "Starting Docker services..." -ForegroundColor Yellow
try {
    docker-compose up -d
    Write-Host "Docker services started successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to start Docker services: $_" -ForegroundColor Red
    exit 1
}

# Start frontend development server
Write-Host "Starting frontend development server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "NoteFusion AI is starting up!" -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API will be available at: http://localhost:8000" -ForegroundColor Cyan
