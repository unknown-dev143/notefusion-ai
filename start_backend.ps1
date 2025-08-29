# Start Backend Server Script
Write-Host "=== Starting NoteFusion AI Backend ===" -ForegroundColor Cyan

# Set environment variables
$env:PYTHONPATH = "$PWD"
$env:ENV = "development"

# Create required directories
$directories = @("uploads", "exports", "logs")
foreach ($dir in $directories) {
    if (-not (Test-Path -Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Green
    }
}

# Check Python version
$pythonVersion = python --version
if (-not $pythonVersion) {
    Write-Host "Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}
Write-Host "Using Python: $pythonVersion" -ForegroundColor Green

# Install Python dependencies
Write-Host "`nInstalling Python dependencies..." -ForegroundColor Yellow
pip install -r backend/requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}

# Initialize database
Write-Host "`nInitializing database..." -ForegroundColor Yellow
python backend/init_db.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to initialize database" -ForegroundColor Red
    exit 1
}

# Start the FastAPI server
Write-Host "`nStarting FastAPI server..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Green
Write-Host "API documentation: http://localhost:8000/docs" -ForegroundColor Green

# Run the FastAPI application
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
