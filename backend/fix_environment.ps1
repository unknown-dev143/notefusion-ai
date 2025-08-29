# Fix Environment Script for NoteFusion AI Backend
Write-Host "Fixing NoteFusion AI Environment..." -ForegroundColor Green
Write-Host "=================================="

# 1. Create virtual environment if it doesn't exist
if (-not (Test-Path .venv)) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
}

# 2. Activate virtual environment
$activatePath = ".\.venv\Scripts\Activate.ps1"
if (Test-Path $activatePath) {
    . $activatePath
} else {
    Write-Host "Error: Could not find virtual environment activation script" -ForegroundColor Red
    exit 1
}

# 3. Upgrade pip
Write-Host "Upgrading pip..."
python -m pip install --upgrade pip

# 4. Install wheel first (helps with package installation)
Write-Host "Installing wheel..."
pip install wheel

# 5. Install updated requirements
Write-Host "Installing dependencies from requirements-updated.txt..."
if (Test-Path "requirements-updated.txt") {
    pip install -r requirements-updated.txt
} else {
    Write-Host "Error: requirements-updated.txt not found" -ForegroundColor Red
    exit 1
}

# 6. Create .env file if it doesn't exist
if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
    Write-Host "Creating .env file from .env.example..."
    Copy-Item .env.example -Destination .env
}

Write-Host "`nEnvironment setup complete!" -ForegroundColor Green
Write-Host "You can now start the server with: .\start_server.ps1" -ForegroundColor Cyan
