# Clean Setup Script for NoteFusion AI
Write-Host "=== NoteFusion AI Clean Setup ===" -ForegroundColor Cyan
Write-Host "This will set up a clean development environment"

# Check Node.js and npm
Write-Host "`n[1/4] Checking Node.js and npm..." -ForegroundColor Yellow
$nodeVersion = node -v
$npmVersion = npm -v
Write-Host "✓ Node.js $nodeVersion, npm $npmVersion detected" -ForegroundColor Green

# Clean up old installations
Write-Host "`n[2/4] Cleaning up old installations..." -ForegroundColor Yellow
if (Test-Path -Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "✓ Removed node_modules" -ForegroundColor Green
}
if (Test-Path -Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "✓ Removed package-lock.json" -ForegroundColor Green
}

# Install dependencies
Write-Host "`n[3/4] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green

# Start development server
Write-Host "`n[4/4] Starting development server..." -ForegroundColor Yellow
Write-Host "✓ Server starting on http://localhost:3000" -ForegroundColor Green
Write-Host "`nSetup complete! The application should open in your default browser shortly." -ForegroundColor Cyan

# Start the development server
npm start
