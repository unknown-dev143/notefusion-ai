Write-Host "Fixing frontend build..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location -Path "frontend"

# Clean up
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules
Remove-Item -Force -ErrorAction SilentlyContinue package-lock.json

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies." -ForegroundColor Red
    exit 1
}

# Run build
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Please check the error above." -ForegroundColor Red
    exit 1
}

Write-Host "Frontend build completed successfully!" -ForegroundColor Green
