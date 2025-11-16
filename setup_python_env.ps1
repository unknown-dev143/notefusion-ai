# Check Python version
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8 or higher from https://www.python.org/downloads/"
    exit 1
}

Write-Host "Found $pythonVersion" -ForegroundColor Green

# Create virtual environment
$venvPath = "$PWD\venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv $venvPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
    Write-Host "Virtual environment created at $venvPath" -ForegroundColor Green
}

# Activate virtual environment
$activateScript = "$venvPath\Scripts\Activate.ps1"
if (-not (Test-Path $activateScript)) {
    Write-Host "Activation script not found at $activateScript" -ForegroundColor Red
    exit 1
}

# Install requirements
Write-Host "Installing requirements..." -ForegroundColor Cyan
& $activateScript
pip install --upgrade pip
pip install -r backend/requirements-dev.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install requirements" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Setup completed successfully!" -ForegroundColor Green
Write-Host "To activate the virtual environment, run:" -ForegroundColor Cyan
Write-Host ".\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "`nThen you can run the monitoring script with:" -ForegroundColor Cyan
Write-Host "python backend/scripts/monitor_security.py" -ForegroundColor White
