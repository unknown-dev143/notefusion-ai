# Install Vercel CLI if not already installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI..."
    npm install -g vercel
}

# Navigate to frontend directory
Set-Location "$PSScriptRoot\frontend"

# Create production environment file
$apiUrl = Read-Host -Prompt "Enter your backend API URL (e.g., https://notefusion-backend.onrender.com)"
"VITE_API_URL=$apiUrl
VITE_USE_MOCKS=false" | Out-File -FilePath ".env.production" -Encoding utf8

# Install dependencies and build
npm install
npm run build

# Deploy to Vercel
vercel --prod

Write-Host "Frontend deployed successfully!"
