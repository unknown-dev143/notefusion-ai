# Deployment script for Vercel
Write-Host "🚀 Starting Vercel Deployment..." -ForegroundColor Cyan

# Clean up previous builds
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
