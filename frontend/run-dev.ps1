# Run development server with detailed logging
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting NoteFusion AI Development Server..." -ForegroundColor Cyan

# Check Node.js version
Write-Host "🔍 Checking Node.js version..."
node -v
if (-not $?) { exit 1 }

# Check npm version
Write-Host "📦 Checking npm version..."
npm -v
if (-not $?) { exit 1 }

# Install dependencies with detailed logging
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps --loglevel verbose
if (-not $?) { 
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1 
}

# Start development server
Write-Host "🚀 Starting development server..." -ForegroundColor Green
npm run dev

if (-not $?) {
    Write-Host "❌ Failed to start development server" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Development server is running!" -ForegroundColor Green
Write-Host "🌐 Open http://localhost:3000 in your browser" -ForegroundColor Cyan
