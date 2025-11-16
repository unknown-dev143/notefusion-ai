# Setup and Run Script for NoteFusion AI

# Function to check if a command exists
function Command-Exists {
    param ($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Check if Python is installed
if (-not (Command-Exists "python")) {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8 or higher from https://www.python.org/downloads/"
    exit 1
}

# Check Python version
$pythonVersion = (python --version 2>&1) -replace '^Python\s+', ''
$pythonMajor = [int]($pythonVersion.Split('.')[0])
$pythonMinor = [int]($pythonVersion.Split('.')[1])

if ($pythonMajor -lt 3 -or ($pythonMajor -eq 3 -and $pythonMinor -lt 8)) {
    Write-Host "❌ Python 3.8 or higher is required (found Python $pythonVersion)" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Python $pythonVersion is installed" -ForegroundColor Green

# Change to the backend directory
$backendDir = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendDir)) {
    Write-Host "❌ Backend directory not found at $backendDir" -ForegroundColor Red
    exit 1
}
Set-Location $backendDir

# Create virtual environment if it doesn't exist
$venvDir = Join-Path $PSScriptRoot "venv"
if (-not (Test-Path $venvDir)) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
    python -m venv $venvDir
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Virtual environment created at $venvDir" -ForegroundColor Green
} else {
    Write-Host "✓ Using existing virtual environment at $venvDir" -ForegroundColor Green
}

# Activate virtual environment
$activateScript = Join-Path $venvDir "Scripts\Activate.ps1"
if (-not (Test-Path $activateScript)) {
    Write-Host "❌ Could not find virtual environment activation script" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
& $activateScript
pip install --upgrade pip
pip install -r requirements-dev.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Cyan
python -c "from app.models.database import init_db; import asyncio; asyncio.run(init_db())"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to initialize database" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Database initialized successfully" -ForegroundColor Green

# Start the FastAPI server
Write-Host "`n🚀 Starting FastAPI server..." -ForegroundColor Green
Write-Host "   - API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "   - API Base URL: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   - Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Start the server with auto-reload
$env:PYTHONPATH = "."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
