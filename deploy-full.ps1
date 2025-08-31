# NoteFusion AI - Full Deployment Script
# This script will set up and deploy the entire NoteFusion AI application

# Check if Docker is running
if (!(docker info 2>&1 | findstr "Containers")) {
    Write-Host "Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Set environment variables
$env:COMPOSE_DOCKER_CLI_BUILD = 1
$env:DOCKER_BUILDKIT = 1

# Create .env file if it doesn't exist
if (!(Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    @"
# NoteFusion AI Environment Variables

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

# Backend
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here

# Email (configure these for production)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
"@ | Out-File -FilePath .env -Encoding utf8
    
    Write-Host "Created .env file. Please review and update the values as needed." -ForegroundColor Yellow
    Write-Host "Press any key to continue with the deployment..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Pull the latest images
Write-Host "`nPulling latest Docker images..." -ForegroundColor Cyan
docker-compose pull

# Build and start the containers
Write-Host "`nBuilding and starting services..." -ForegroundColor Cyan
docker-compose up -d --build

# Show the status of the containers
Write-Host "`nContainer status:" -ForegroundColor Green
docker-compose ps

# Show the application URLs
Write-Host "`nApplication URLs:" -ForegroundColor Green
Write-Host "- Frontend:    http://localhost:3000"
Write-Host "- Backend:     http://localhost:8000"
Write-Host "- Database:    http://localhost:8080 (pgAdmin - username: admin@example.com, password: admin)"
Write-Host "- Monitoring:  http://localhost:3001 (Grafana - username: admin, password: admin)"
Write-Host "- Prometheus:  http://localhost:9090"

# Show important notes
Write-Host "`nImportant Notes:" -ForegroundColor Yellow
Write-Host "1. The first startup may take a few minutes as it initializes the database."
Write-Host "2. Make sure to change the default credentials in the .env file for production use."
Write-Host "3. For production, set up proper SSL certificates and update the configuration."

Write-Host "`nDeployment completed!" -ForegroundColor Green
Write-Host "Use 'docker-compose logs -f' to view the logs."
Write-Host "Use 'docker-compose down' to stop the application."
