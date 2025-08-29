# Simple deployment script for NoteFusion AI
Write-Host "🚀 Starting NoteFusion AI Deployment..." -ForegroundColor Cyan

# Function to check if command exists
function Test-CommandExists {
    param ($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Check for Node.js
if (-not (Test-CommandExists "node")) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check for npm
if (-not (Test-CommandExists "npm")) {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js and npm are installed" -ForegroundColor Green

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Cyan
npm run build

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# Start the application
Write-Host "🚀 Starting NoteFusion AI..." -ForegroundColor Cyan

# Start backend server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ../backend; python -m uvicorn main:app --reload"

# Start frontend server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "✅ NoteFusion AI is now running!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 Backend API: http://localhost:8000" -ForegroundColor Cyan
