# Check if Docker is installed and running

# Check if Docker Desktop is installed
$dockerPath = "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
if (-not (Test-Path $dockerPath)) {
    Write-Host "❌ Docker Desktop is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop/"
    exit 1
}

# Check if Docker service is running
$service = Get-Service -Name "com.docker.service" -ErrorAction SilentlyContinue
if ($null -eq $service) {
    Write-Host "❌ Docker service is not found. Please make sure Docker Desktop is properly installed."
    exit 1
}

if ($service.Status -ne "Running") {
    Write-Host "🚀 Starting Docker service..."
    try {
        Start-Service -Name "com.docker.service" -ErrorAction Stop
        # Wait for Docker to be ready
        Start-Sleep -Seconds 10
        Write-Host "✅ Docker service started successfully"
    }
    catch {
        Write-Host "❌ Failed to start Docker service: $_"
        Write-Host "Please start Docker Desktop manually and try again."
        exit 1
    }
}

# Verify Docker CLI is working
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw $dockerVersion
    }
    Write-Host "✅ Docker is running: $dockerVersion"
    
    # Verify Docker Compose
    $composeVersion = docker-compose --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw $composeVersion
    }
    Write-Host "✅ Docker Compose is available: $composeVersion"
    
    # List running containers
    Write-Host "\n🐳 Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    
    exit 0
}
catch {
    Write-Host "❌ Error running Docker commands: $_"
    Write-Host "Please make sure Docker Desktop is running and try again"
    exit 1
}
