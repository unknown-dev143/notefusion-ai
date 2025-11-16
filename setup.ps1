# Setup script for NoteFusion AI
Write-Host "Setting up NoteFusion AI..." -ForegroundColor Green

# Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not installed or not in PATH. Please install Python 3.8+ first." -ForegroundColor Red
    Start-Process "https://www.python.org/downloads/"
    exit 1
}

# Create and activate virtual environment
if (-not (Test-Path ".\venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv
}

# Activate venv
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
.\venv\Scripts\Activate.ps1

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
pip install -r backend/requirements.txt

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
cd frontend
npm install
cd ..

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "To start the backend server, run: .\start_backend.ps1" -ForegroundColor Yellow
Write-Host "To start the frontend, run: .\start_frontend.ps1" -ForegroundColor Yellow
