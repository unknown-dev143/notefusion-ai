# Setup Project Script for NoteFusion AI
Write-Host "=== Starting Project Setup ===" -ForegroundColor Cyan

# 1. Check Python Installation
Write-Host "`n1. Checking Python installation..." -ForegroundColor Yellow
$pythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source

if (-not $pythonPath) {
    Write-Host "Python not found in PATH. Please install Python 3.8+ from python.org" -ForegroundColor Red
    Write-Host "Download Python: https://www.python.org/downloads/" -ForegroundColor Cyan
    Write-Host "Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Cyan
    exit 1
}

$pythonVersion = & { python --version 2>&1 }
Write-Host "Found Python: $pythonVersion" -ForegroundColor Green

# 2. Create and activate virtual environment
Write-Host "`n2. Setting up virtual environment..." -ForegroundColor Yellow
if (Test-Path .venv) {
    Remove-Item -Recurse -Force .venv
}

python -m venv .venv
if (-not $?) {
    Write-Host "Failed to create virtual environment" -ForegroundColor Red
    exit 1
}

$activatePath = ".\.venv\Scripts\Activate.ps1"
if (-not (Test-Path $activatePath)) {
    Write-Host "Virtual environment activation script not found" -ForegroundColor Red
    exit 1
}

# 3. Activate environment and install dependencies
Write-Host "`n3. Installing dependencies..." -ForegroundColor Yellow
& $activatePath
if (-not $?) {
    Write-Host "Failed to activate virtual environment" -ForegroundColor Red
    exit 1
}

# Upgrade pip
python -m pip install --upgrade pip
if (-not $?) {
    Write-Host "Failed to upgrade pip" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Cyan
pip install -r backend/requirements.txt
if (-not $?) {
    Write-Host "Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install --legacy-peer-deps
if (-not $?) {
    Write-Host "Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

# 4. Create environment files if they don't exist
Write-Host "`n4. Setting up environment files..." -ForegroundColor Yellow

# Backend .env
if (-not (Test-Path .\.env)) {
    @"
# Application Settings
ENV=development
DEBUG=true
SECRET_KEY=your-secret-key-123

# Database
DATABASE_URL=sqlite+aiosqlite:///./notefusion.db

# JWT
JWT_SECRET_KEY=your-jwt-secret-123
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email (optional)
SMTP_SERVER=smtp.example.com
SMTP_PORT=587
EMAIL_USERNAME=your-email@example.com
EMAIL_PASSWORD=your-email-password
"@ | Out-File -FilePath .\.env -Encoding UTF8
    Write-Host "Created .env file" -ForegroundColor Green
}

# Frontend .env
if (-not (Test-Path .\frontend\.env)) {
    @"
VITE_API_BASE_URL=http://localhost:8000/api
"@ | Out-File -FilePath .\frontend\.env -Encoding UTF8
    Write-Host "Created frontend/.env file" -ForegroundColor Green
}

# 5. Create start scripts
Write-Host "`n5. Creating start scripts..." -ForegroundColor Yellow

# Start Backend Script
@"
@echo off
call .venv\Scripts\activate
python -m uvicorn backend.app.main:app --reload --port 8000
"@ | Out-File -FilePath .\start_backend.ps1 -Encoding UTF8

# Start Frontend Script
@"
@echo off
cd frontend
npm run dev
"@ | Out-File -FilePath .\start_frontend.ps1 -Encoding UTF8

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "`nTo start the backend, run:" -ForegroundColor Cyan
Write-Host ".\start_backend.ps1" -ForegroundColor White
Write-Host "`nTo start the frontend (in a new terminal), run:" -ForegroundColor Cyan
Write-Host ".\start_frontend.ps1" -ForegroundColor White
Write-Host "`nAccess the application at: http://localhost:3000" -ForegroundColor Green
