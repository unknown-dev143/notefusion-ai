# Create .env.production file
$envContent = @"
VITE_API_URL=https://notefusion-ai-backend.railway.app
VITE_USE_MOCKS=false
VITE_GA_MEASUREMENT_ID=
"@

# Write to .env.production
$envPath = Join-Path -Path "$PSScriptRoot\frontend" -ChildPath ".env.production"
$envContent | Out-File -FilePath $envPath -Encoding utf8

Write-Host "Created production environment file at: $envPath"

# Install dependencies and build
Set-Location "$PSScriptRoot\frontend"
npm install
npm run build

Write-Host "Frontend is ready for production deployment!"
