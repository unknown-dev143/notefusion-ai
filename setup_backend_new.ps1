Write-Host "=== NoteFusion AI Backend Setup ===`n" -ForegroundColor Cyan

# Check if Python is installed
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Python is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/downloads/"
    Write-Host "Make sure to check 'Add Python to PATH' during installation.`n"
    exit 1
}
Write-Host "[1/7] Found Python: $pythonVersion" -ForegroundColor Green

# Create and activate virtual environment
Write-Host "[2/7] Creating virtual environment..." -ForegroundColor Cyan
python -m venv .venv
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to create virtual environment." -ForegroundColor Red
    exit 1
}

# Activate the virtual environment
Write-Host "[3/7] Activating virtual environment..." -ForegroundColor Cyan
.venv\Scripts\Activate.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to activate virtual environment." -ForegroundColor Red
    exit 1
}

# Upgrade pip and install dependencies
Write-Host "[4/7] Installing dependencies..." -ForegroundColor Cyan
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies." -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "[5/7] Creating .env file..." -ForegroundColor Cyan
    if (Test-Path .env.example) {
        Copy-Item .env.example -Destination .env
        Write-Host "Created .env from .env.example" -ForegroundColor Green
    } else {
        @"
# NoteFusion AI Environment Variables
DATABASE_URL=sqlite+aiosqlite:///./notefusion.db
SECRET_KEY=change_this_to_a_secure_secret_key
JWT_SECRET_KEY=change_this_to_a_secure_jwt_secret_key
SECURITY_PASSWORD_SALT=change_this_to_a_secure_salt
JWT_ALGORITHM=HS256
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
"@ | Out-File -FilePath .env -Encoding utf8
        Write-Host "Created default .env file" -ForegroundColor Yellow
    }
    Write-Host "Please edit the .env file with your configuration." -ForegroundColor Yellow
} else {
    Write-Host "[5/7] .env file already exists." -ForegroundColor Green
}

# Set up database
Write-Host "[6/7] Setting up database..." -ForegroundColor Cyan
Set-Location backend
python -c "from app.models.database import Base, engine; Base.metadata.create_all(bind=engine)"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Database setup completed with warnings." -ForegroundColor Yellow
}

# Start the development server
Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server.`n" -ForegroundColor Cyan

uvicorn app.main:app --reload
