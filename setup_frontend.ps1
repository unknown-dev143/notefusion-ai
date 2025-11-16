# Setup script for NoteFusion AI Frontend
Write-Host "Setting up NoteFusion AI Frontend..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location -Path "$PSScriptRoot\frontend"

# Create .env.development if it doesn't exist
if (-not (Test-Path -Path ".env.development")) {
    Write-Host "Creating .env.development file..."
    @"
# Environment Configuration
VITE_API_URL=http://localhost:8000
VITE_ENV=development
"@ | Out-File -FilePath ".env.development" -Encoding utf8
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Start the development server
Write-Host "`n✅ Setup completed successfully!" -ForegroundColor Green
Write-Host "To start the development server, run:" -ForegroundColor Cyan
Write-Host "  cd "$PSScriptRoot\frontend""
Write-Host "  npm run dev"
