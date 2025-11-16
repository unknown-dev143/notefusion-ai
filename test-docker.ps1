# Test Docker installation
try {
    Write-Host "Testing Docker installation..." -ForegroundColor Cyan
    
    # Check if docker command is available
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not in the system PATH or not installed correctly."
    }
    Write-Host "✅ Docker version: $dockerVersion" -ForegroundColor Green
    
    # Test running a simple container
    Write-Host "`nTesting Docker container execution..." -ForegroundColor Cyan
    $testRun = docker run --rm hello-world 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to run Docker container. Error: $testRun"
    }
    Write-Host "✅ Docker container test successful!" -ForegroundColor Green
    
    # Show Docker info
    Write-Host "`nDocker system information:" -ForegroundColor Cyan
    docker info 2>&1 | Out-String
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "`nTroubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Make sure Docker Desktop is running"
    Write-Host "2. Try running PowerShell as Administrator"
    Write-Host "3. Check if virtualization is enabled in BIOS"
    Write-Host "4. Make sure WSL 2 is properly installed"
    exit 1
}
