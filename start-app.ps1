# Start Docker Compose with environment variables
$env:COMPOSE_DOCKER_CLI_BUILD=1
$env:DOCKER_BUILDKIT=1

# Set environment variables for Docker Compose
$env:POSTGRES_USER="notefusion"
$env:POSTGRES_PASSWORD="notefusion123"
$env:POSTGRES_DB="notefusion"
$env:REDIS_PASSWORD="your-redis-password"
$env:SECRET_KEY="your-secret-key-here"

# Build and start the containers
docker-compose up --build -d

# Show the status of the containers
docker ps

Write-Host "Application is starting..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Database is running on port: 5432" -ForegroundColor Cyan
Write-Host "Redis is running on port: 6379" -ForegroundColor Cyan

# Show logs
docker-compose logs -f
