# Create and activate virtual environment
Write-Host "Creating virtual environment..." -ForegroundColor Cyan
python -m venv .venv

# Activate the virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
.venv\Scripts\Activate.ps1

# Install required Python packages
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
pip install fastapi uvicorn python-dotenv

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
cd frontend
npm install --legacy-peer-deps
cd ..

Write-Host "\nSetup complete!" -ForegroundColor Green
Write-Host "To start the backend:  python -m uvicorn app.main:app --reload" -ForegroundColor Yellow
Write-Host "To start the frontend: cd frontend && npm run dev" -ForegroundColor Yellow
