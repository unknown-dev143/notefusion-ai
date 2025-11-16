# Remove existing virtual environment if it exists
Remove-Item -Recurse -Force .\venv -ErrorAction SilentlyContinue

# Create new virtual environment
Write-Host "Creating new virtual environment..."
python -m venv venv

# Activate the virtual environment
Write-Host "Activating virtual environment..."
.\venv\Scripts\Activate.ps1

# Install required packages
Write-Host "Installing required packages..."
pip install fastapi uvicorn sqlalchemy aiosqlite python-multipart

# Set environment variables
Write-Host "Setting up environment variables..."
$env:DATABASE_URL = "sqlite+aiosqlite:///./notefusion.db"
$env:SECRET_KEY = "test-secret-key"
$env:JWT_SECRET_KEY = "test-jwt-secret-key"

# Navigate to backend directory
Set-Location backend

# Run the FastAPI server
Write-Host "Starting FastAPI server..."
Write-Host "Access the API documentation at: http://127.0.0.1:8000/docs"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
