# Check Python version
$pythonVersion = python --version
Write-Host "Python Version: $pythonVersion"

# Create virtual environment if it doesn't exist
if (-not (Test-Path ".\venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..."
.\venv\Scripts\Activate.ps1

# Install required packages
Write-Host "Installing required packages..."
pip install fastapi uvicorn sqlalchemy aiosqlite python-multipart

# Set environment variables
Write-Host "Setting environment variables..."
$env:DATABASE_URL = "sqlite+aiosqlite:///./notefusion.db"
$env:SECRET_KEY = "test-secret-key"
$env:JWT_SECRET_KEY = "test-jwt-secret-key"

# Navigate to backend directory
Set-Location backend

# Run the FastAPI server
Write-Host "Starting FastAPI server..."
Write-Host "Access the API documentation at: http://127.0.0.1:8000/docs"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
