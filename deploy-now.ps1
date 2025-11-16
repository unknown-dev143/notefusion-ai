# Check if Docker is running
if (!(docker info 2>&1 | findstr "Containers")) {
    Write-Host "Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Set environment variables
$env:POSTGRES_USER = "notefusion"
$env:POSTGRES_PASSWORD = "notefusion123"
$env:POSTGRES_DB = "notefusion"
$env:REDIS_PASSWORD = "your-redis-password"
$env:NODE_ENV = "production"

# Create .env file if it doesn't exist
if (!(Test-Path .env)) {
    Write-Host "Creating .env file..."
    @"
# Database
POSTGRES_USER=notefusion
POSTGRES_PASSWORD=notefusion123
POSTGRES_DB=notefusion

# Redis
REDIS_PASSWORD=your-redis-password

# Node Environment
NODE_ENV=production

# Frontend
VITE_API_URL=http://localhost:8000
"@ | Out-File -FilePath .env -Encoding utf8
}

# Build and start the application
Write-Host "Starting NoteFusion AI deployment..." -ForegroundColor Cyan

# Pull the latest images
Write-Host "Pulling latest Docker images..." -ForegroundColor Cyan
docker-compose pull

# Build and start the containers
Write-Host "Starting services..." -ForegroundColor Cyan
docker-compose up -d --build

# Show the status of the containers
Write-Host "`nContainer status:" -ForegroundColor Green
docker-compose ps

# Show the application URLs
Write-Host "`nApplication URLs:" -ForegroundColor Green
Write-Host "- Frontend:    http://localhost:3000"
Write-Host "- Backend:     http://localhost:8000"
Write-Host "- Database:    http://localhost:8080 (pgAdmin)"
Write-Host "- Monitoring:  http://localhost:3001 (Grafana)"
Write-Host "- Prometheus:  http://localhost:9090"

Write-Host "`nDeployment completed!" -ForegroundColor Green
Write-Host "Use 'docker-compose logs -f' to view the logs."
Write-Host "Use 'docker-compose down' to stop the application."
