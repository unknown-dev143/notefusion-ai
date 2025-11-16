# Deploy NoteFusion AI Frontend to Vercel

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI..."
    npm install -g vercel
}

# Login to Vercel
vercel login

# Set the API URL from command line argument or prompt
$apiUrl = $args[0]
if (-not $apiUrl) {
    $apiUrl = Read-Host "Enter the backend API URL (e.g., https://api.example.com)"
}

# Create .env.production file
$envContent = @"
VITE_API_URL=$apiUrl
VITE_USE_MOCKS=false
"@

# Write to .env.production
$envContent | Out-File -FilePath ".env.production" -Encoding utf8

# Install dependencies
Write-Host "Installing frontend dependencies..."
npm install

# Build the application
Write-Host "Building the frontend..."
npm run build

# Deploy to Vercel
Write-Host "Deploying to Vercel..."
vercel --prod

# Clean up
Remove-Item ".env.production" -ErrorAction SilentlyContinue

Write-Host "Frontend deployed successfully!"
