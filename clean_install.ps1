# Clean Install Script for NoteFusion AI
Write-Host "=== Starting Clean Installation ===" -ForegroundColor Cyan

# Step 1: Clean up old installations
Write-Host "Cleaning up old installations..." -ForegroundColor Yellow
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .\venv
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .\frontend\node_modules
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .\frontend\.next
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .\frontend\.vite

# Step 2: Set up Python virtual environment
Write-Host "Setting up Python virtual environment..." -ForegroundColor Cyan
python -m venv venv
.\venv\Scripts\Activate.ps1

# Step 3: Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
pip install --upgrade pip
pip install -r backend\requirements.txt

# Step 4: Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
cd frontend
npm install --legacy-peer-deps
cd ..

Write-Host "\n=== Installation Complete ===" -ForegroundColor Green
Write-Host "To start the backend:  .\start_backend.ps1" -ForegroundColor Yellow
Write-Host "To start the frontend: cd frontend && npm run dev" -ForegroundColor Yellow
