# Deploy NoteFusion AI Backend to Railway

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
railway variables set ENVIRONMENT=production
railway variables set PORT=8000
railway variables set LOG_LEVEL=info
railway variables set SECRET_KEY=$(openssl rand -hex 32)
railway variables set JWT_SECRET_KEY=$(openssl rand -hex 32)
railway variables set JWT_ALGORITHM=HS256
railway variables set JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
railway variables set JWT_REFRESH_TOKEN_EXPIRE_DAYS=30
railway variables set JWT_VERIFICATION_TOKEN_EXPIRE_HOURS=24
railway variables set JWT_PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=60

# Get database URL and set it
$dbUrl = railway variables get DATABASE_URL
railway variables set DATABASE_URL=$dbUrl

# Install Python dependencies
Write-Host "Installing Python dependencies..."
railway run pip install -r requirements.txt

# Run database migrations
Write-Host "Running database migrations..."
railway run alembic upgrade head

# Deploy the application
Write-Host "Deploying to Railway..."
railway up --detach

# Get the deployment URL
$deployUrl = railway status --json | ConvertFrom-Json | Select-Object -ExpandProperty service | Select-Object -ExpandProperty url

Write-Host "Backend deployed successfully!"
Write-Host "Backend URL: $deployUrl"
Write-Host "Please update the VITE_API_URL in frontend/.env.production with the above URL"
