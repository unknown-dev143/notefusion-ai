# Install Railway CLI if not already installed
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Railway CLI..."
    npm install -g @railway/cli
}

# Login to Railway
railway login

# Create a new Railway project
Write-Host "Creating new Railway project..."
railway init notefusion-ai-backend

# Add PostgreSQL database
Write-Host "Adding PostgreSQL database..."
railway add --plugin postgresql

# Set environment variables
Write-Host "Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=8000
railway variables set RAILWAY_ENVIRONMENT=production

# Get database URL and set it
$dbUrl = railway variables get DATABASE_URL
railway variables set DATABASE_URL=$dbUrl

# Deploy the application
Write-Host "Deploying to Railway..."
railway up --detach

# Get the deployment URL
$deployUrl = railway status --json | ConvertFrom-Json | Select-Object -ExpandProperty service | Select-Object -ExpandProperty url

Write-Host "Backend deployed successfully!"
Write-Host "Backend URL: $deployUrl"
Write-Host "Please update the VITE_API_URL in frontend/.env.production with the above URL"
