# Setup development environment for NoteFusion AI

# Set error action preference
$ErrorActionPreference = "Stop"

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Cyan
$pythonVersion = python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Python is not installed. Please install Python 3.9 or higher from https://www.python.org/downloads/" -ForegroundColor Red
    exit 1
}
Write-Host "Found $pythonVersion" -ForegroundColor Green

# Check if pip is installed
Write-Host "Checking pip installation..." -ForegroundColor Cyan
$pipVersion = python -m pip --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "pip is not installed. Please install pip and try again." -ForegroundColor Red
    exit 1
}
Write-Host "Found $($pipVersion.Split([Environment]::NewLine)[0])" -ForegroundColor Green

# Create and activate virtual environment
Write-Host "Setting up Python virtual environment..." -ForegroundColor Cyan
if (-not (Test-Path "venv")) {
    python -m venv venv
}
.\venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
pip install -r requirements.txt

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location ..\frontend
npm install

# Create .env files if they don't exist
Write-Host "Setting up environment variables..." -ForegroundColor Cyan

# Backend .env
$backendEnvPath = ".\backend\.env"
if (-not (Test-Path $backendEnvPath)) {
    @"
# App
ENV=development
SECRET_KEY=your-secret-key-change-in-production

# Database
DATABASE_URL=sqlite+aiosqlite:///./notefusion.db

# Authentication
JWT_SECRET_KEY=your-jwt-secret-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0
"@ | Out-File -FilePath $backendEnvPath -Encoding utf8
    Write-Host "Created $backendEnvPath" -ForegroundColor Green
}

# Frontend .env
$frontendEnvPath = ".\frontend\.env"
if (-not (Test-Path $frontendEnvPath)) {
    @"
# API Configuration
REACT_APP_API_URL=http://localhost:8000/api/v1

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
"@ | Out-File -FilePath $frontendEnvPath -Encoding utf8
    Write-Host "Created $frontendEnvPath" -ForegroundColor Green
}

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Cyan
Set-Location ..\backend
python -m alembic upgrade head
python scripts/init_db.py

Write-Host ""
Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development servers:" -ForegroundColor Cyan
Write-Host "1. Backend: cd backend && python scripts/run_dev.py" -ForegroundColor Yellow
Write-Host "2. Frontend: cd frontend && npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "Don't forget to update the .env files with your actual configuration!" -ForegroundColor Yellow
