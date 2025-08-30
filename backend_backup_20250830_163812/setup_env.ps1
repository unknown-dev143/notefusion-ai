# Setup script for NoteFusion AI Backend
Write-Host "Setting up NoteFusion AI Backend..." -ForegroundColor Green
Write-Host "==================================="

# Check Python version
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}
Write-Host "Python version: $pythonVersion"

# Create virtual environment if it doesn't exist
if (-not (Test-Path .venv)) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
}

# Activate virtual environment
Write-Host "Activating virtual environment..."
.venv\Scripts\Activate.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to activate virtual environment" -ForegroundColor Red
    exit 1
}

# Upgrade pip
Write-Host "Upgrading pip..."
python -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Failed to upgrade pip, but continuing..." -ForegroundColor Yellow
}

# Install dependencies
Write-Host "Installing dependencies..."
pip install -r requirements-fixed.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..."
    if (Test-Path .env.example) {
        Copy-Item .env.example -Destination .env
        Write-Host "Created .env file from .env.example" -ForegroundColor Green
    } else {
        Write-Host "Warning: .env.example not found. You'll need to create a .env file manually." -ForegroundColor Yellow
    }
}

# Initialize database
Write-Host "Initializing database..."
try {
    python -c "from app.models.database import init_db; import asyncio; asyncio.run(init_db())"
    Write-Host "Database initialized successfully" -ForegroundColor Green
} catch {
    Write-Host "Warning: Database initialization had issues, but continuing..." -ForegroundColor Yellow
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "To start the server, run: .\start_server.ps1" -ForegroundColor Cyan
