# Run database migrations for NoteFusion AI
Write-Host "🚀 Starting database migrations..." -ForegroundColor Cyan

# Set environment variables
$env:PYTHONPATH = $PWD
$env:PYTHONIOENCODING = "UTF-8"

# Check if virtual environment exists
$venvPath = ".\venv"

if (-not (Test-Path $venvPath)) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv $venvPath
    
    # Activate the virtual environment
    $activatePath = ".\venv\Scripts\Activate.ps1"
    if (Test-Path $activatePath) {
        . $activatePath
    } else {
        Write-Host "❌ Could not find virtual environment activation script" -ForegroundColor Red
        exit 1
    }
    
    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -e .
} else {
    # Activate the virtual environment
    $activatePath = ".\venv\Scripts\Activate.ps1"
    if (Test-Path $activatePath) {
        . $activatePath
    } else {
        Write-Host "❌ Could not find virtual environment activation script" -ForegroundColor Red
        exit 1
    }
}

# Run migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
python .\run_migrations.py

# Check if migrations were successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database migrations completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Error running database migrations!" -ForegroundColor Red
    exit 1
}

# Pause to see the output
Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
