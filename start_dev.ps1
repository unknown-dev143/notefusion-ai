# Start Development Environment Script
# Run this in PowerShell

# Start Redis if not running
if (-not (Get-Service -Name redis -ErrorAction SilentlyContinue)) {
    Write-Host "Redis service not found. Make sure Redis is installed and running."
    exit 1
}

if ((Get-Service -Name redis).Status -ne 'Running') {
    Start-Service redis
}

# Start PostgreSQL if not running
if (-not (Get-Service -Name postgresql* -ErrorAction SilentlyContinue)) {
    Write-Host "PostgreSQL service not found. Make sure PostgreSQL is installed and running."
    exit 1
}

if ((Get-Service -Name postgresql*).Status -ne 'Running') {
    Start-Service postgresql*
}

# Activate Python virtual environment
$venvPath = ".\venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "Virtual environment not found. Please run setup_local.ps1 first."
    exit 1
}

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$pwd'; .\venv\Scripts\activate; uvicorn app.main:app --reload"

# Start frontend in a new window
if (Test-Path ".\frontend") {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$pwd\frontend'; npm start"
}

Write-Host "Development environment started!"
Write-Host "- Backend: http://localhost:8000"
Write-Host "- Frontend: http://localhost:3000"
Write-Host "- API Docs: http://localhost:8000/docs"
