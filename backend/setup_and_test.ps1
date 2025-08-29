# Setup and Test Script for NoteFusion AI Backend
# This script will:
# 1. Create a new virtual environment
# 2. Install required packages
# 3. Run the test suite

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Check if Python is installed
if (-not (Test-CommandExists "python")) {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

$pythonVersion = python --version
Write-Host "✓ Found Python: $pythonVersion" -ForegroundColor Green

# Create virtual environment
$venvPath = ".\venv"
if (Test-Path $venvPath) {
    Write-Host "Removing existing virtual environment..." -ForegroundColor Yellow
    Remove-Item -Path $venvPath -Recurse -Force
}

Write-Host "Creating new virtual environment..." -ForegroundColor Cyan
python -m venv $venvPath

if (-not (Test-Path "$venvPath\Scripts\Activate.ps1")) {
    Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
    exit 1
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
.\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Cyan
python -m pip install --upgrade pip

# Install requirements
Write-Host "Installing requirements..." -ForegroundColor Cyan
pip install -r requirements.txt

# Install test dependencies
Write-Host "Installing test dependencies..." -ForegroundColor Cyan
pip install pytest pytest-asyncio pytest-cov

# Run basic test
Write-Host "`nRunning basic test..." -ForegroundColor Cyan
$testResult = python -m pytest tests/test_basic.py -v

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Basic test passed!" -ForegroundColor Green
    
    # Run task API tests if basic test passes
    Write-Host "`nRunning task API tests..." -ForegroundColor Cyan
    $testResult = python -m pytest tests/test_tasks_simple.py -v
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ All tests passed!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Task API tests failed" -ForegroundColor Red
    }
} else {
    Write-Host "`n❌ Basic test failed" -ForegroundColor Red
}

# Deactivate virtual environment
Write-Host "`nDeactivating virtual environment..." -ForegroundColor Cyan
deactivate
