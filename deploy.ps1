# Deployment Script for NoteFusion AI
# Version: 1.0.0
# Description: Automated deployment script for NoteFusion AI services

# Set error action preference
$ErrorActionPreference = "Stop"

# Import required modules
#Requires -Version 7.0

# Configuration
$Config = @{
    ProjectName = "NoteFusion AI"
    Version = "1.0.0"
    RequiredDockerVersion = "20.10.0"
    RequiredDockerComposeVersion = "2.0.0"
}

# Colors for console output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Debug = "Gray"
}

# Logging function
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Color = "White"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $formattedMessage = "[$timestamp] [$Level] $Message"
    Write-Host $formattedMessage -ForegroundColor $Color
}

# Check if running as administrator
function Test-Admin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Validate environment
function Test-Environment {
    Write-Log "🔍 Validating environment..." -Level "INFO" -Color $Colors.Info
    
    # Check if running as admin
    if (-not (Test-Admin)) {
        Write-Log "⚠️  Warning: Not running as administrator. Some operations might require elevated privileges." -Level "WARNING" -Color $Colors.Warning
    }
    
    # Check Docker installation and version
    try {
        $dockerVersion = (docker version --format '{{.Server.Version}}' 2>&1) | Out-String
        if ($LASTEXITCODE -ne 0) {
            throw "Docker is not running. Please start Docker Desktop and try again."
        }
        
        $dockerVersion = $dockerVersion.Trim()
        Write-Log "✓ Docker version: $dockerVersion" -Level "INFO" -Color $Colors.Success
        
        # Compare versions
        $requiredVersion = [System.Version]$Config.RequiredDockerVersion
        $currentVersion = [System.Version]$dockerVersion
        
        if ($currentVersion -lt $requiredVersion) {
            Write-Log "⚠️  Warning: Docker version $dockerVersion is below the recommended version $($Config.RequiredDockerVersion)" -Level "WARNING" -Color $Colors.Warning
        }
    } catch {
        Write-Log "❌ Docker is not installed or not in PATH. Please install Docker Desktop first." -Level "ERROR" -Color $Colors.Error
        exit 1
    }
    
    # Check Docker Compose version
    try {
        $composeVersion = (docker-compose version --short 2>&1) | Out-String
        if ($LASTEXITCODE -ne 0) {
            throw "Docker Compose is not installed or not in PATH."
        }
        
        $composeVersion = $composeVersion.Trim()
        Write-Log "✓ Docker Compose version: $composeVersion" -Level "INFO" -Color $Colors.Success
        
        # Compare versions
        $requiredVersion = [System.Version]$Config.RequiredDockerComposeVersion
        $currentVersion = [System.Version]($composeVersion -replace '^v', '' -split '[^0-9.]' | Where-Object { $_ -ne '' } | Select-Object -First 1)
        
        if ($currentVersion -lt $requiredVersion) {
            Write-Log "⚠️  Warning: Docker Compose version $composeVersion is below the recommended version $($Config.RequiredDockerComposeVersion)" -Level "WARNING" -Color $Colors.Warning
        }
    } catch {
        Write-Log "❌ Docker Compose is not installed or not in PATH. Please install Docker Compose." -Level "ERROR" -Color $Colors.Error
        exit 1
    }
    
    # Check available resources
    $totalMemoryGB = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB
    if ($totalMemoryGB -lt 4) {
        Write-Log "⚠️  Warning: System has less than 4GB of RAM ($([math]::Round($totalMemoryGB, 2))GB detected). Performance may be degraded." -Level "WARNING" -Color $Colors.Warning
    }
    
    # Check available disk space (check C: drive by default)
    $disk = Get-PSDrive -Name C
    $freeSpaceGB = $disk.Free / 1GB
    if ($freeSpaceGB -lt 10) {
        Write-Log "⚠️  Warning: Low disk space on $($disk.Name): $([math]::Round($freeSpaceGB, 2))GB free. At least 10GB recommended." -Level "WARNING" -Color $Colors.Warning
    }
    
    Write-Log "✓ Environment validation completed successfully" -Level "INFO" -Color $Colors.Success
}

# Set environment variables
function Set-EnvironmentVariables {
    Write-Log "⚙️  Configuring environment variables..." -Level "INFO" -Color $Colors.Info
    
    # Load .env file if exists
    $envFile = Join-Path $PSScriptRoot ".env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            $name, $value = $_.Split('=', 2)
            if ($name -and $value) {
                [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim())
            }
        }
        Write-Log "✓ Loaded environment variables from .env file" -Level "DEBUG" -Color $Colors.Debug
    } else {
        # Set default values if .env doesn't exist
        if (-not $env:POSTGRES_USER) { $env:POSTGRES_USER = "notefusion" }
        if (-not $env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD = (New-Guid).Guid }
        if (-not $env:POSTGRES_DB) { $env:POSTGRES_DB = "notefusion" }
        if (-not $env:REDIS_PASSWORD) { $env:REDIS_PASSWORD = (New-Guid).Guid }
        if (-not $env:SECRET_KEY) { $env:SECRET_KEY = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes(32)) }
        if (-not $env:JWT_SECRET_KEY) { $env:JWT_SECRET_KEY = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes(32)) }
        
        # Save to .env file
        @"
# Database
POSTGRES_USER=$($env:POSTGRES_USER)
POSTGRES_PASSWORD=$($env:POSTGRES_PASSWORD)
POSTGRES_DB=$($env:POSTGRES_DB)

# Redis
REDIS_PASSWORD=$($env:REDIS_PASSWORD)

# Security
SECRET_KEY=$($env:SECRET_KEY)
JWT_SECRET_KEY=$($env:JWT_SECRET_KEY)

# Backend
ENV=production
DATABASE_URL=postgresql+asyncpg://$($env:POSTGRES_USER):$($env:POSTGRES_PASSWORD)@db:5432/$($env:POSTGRES_DB)
REDIS_URL=redis://:$($env:REDIS_PASSWORD)@redis:6379/0
"@ | Out-File -FilePath $envFile -Encoding utf8
        
        Write-Log "✓ Created .env file with generated credentials" -Level "INFO" -Color $Colors.Success
    }
}

# Build and start services
function Start-Services {
    [CmdletBinding()]
    param (
        [Parameter()]
        [switch]$Build,
        
        [Parameter()]
        [switch]$Pull,
        
        [Parameter()]
        [switch]$NoDetach
    )
    
    # Set defaults if not provided
    $Build = $Build -or $true
    $Pull = $Pull -or $true
    $Detach = -not $NoDetach
    
    Write-Log "🚀 Starting $($Config.ProjectName) deployment..." -Level "INFO" -Color $Colors.Info
    
    try {
        # Pull latest images if requested
        if ($Pull) {
            Write-Log "🔍 Pulling latest images..." -Level "INFO" -Color $Colors.Info
            docker-compose -f docker-compose.yml pull
            if ($LASTEXITCODE -ne 0) {
                throw "Failed to pull Docker images"
            }
        }
        
        # Build and start services
        $composeCommand = @(
            "docker-compose",
            "-f", "docker-compose.yml"
        )
        
        if ($Build) {
            Write-Log "🔨 Building services..." -Level "INFO" -Color $Colors.Info
            $composeCommand += "--build"
        }
        
        if ($Detach) {
            $composeCommand += "up -d"
        } else {
            $composeCommand += "up"
        }
        
        Write-Log "🚀 Starting services..." -Level "INFO" -Color $Colors.Info
        & $composeCommand[0] $composeCommand[1..$composeCommand.Length]
        
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to start services"
        }
        
        # Wait for services to be ready
        Write-Log "⏳ Waiting for services to be ready..." -Level "INFO" -Color $Colors.Info
        Start-Sleep -Seconds 10
        
        # Run database migrations
        Write-Log "🔄 Running database migrations..." -Level "INFO" -Color $Colors.Info
        docker-compose exec -T backend alembic upgrade head
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "⚠️  Warning: Failed to run database migrations" -Level "WARNING" -Color $Colors.Warning
        }
        
        # Show service status
        Show-ServiceStatus
        
        Write-Log "✅ Deployment completed successfully!" -Level "SUCCESS" -Color $Colors.Success
    } catch {
        Write-Log "❌ Deployment failed: $_" -Level "ERROR" -Color $Colors.Error
        exit 1
    }
}

# Show service status
function Show-ServiceStatus {
    Write-Log "📊 Service Status:" -Level "INFO" -Color $Colors.Info
    
    # Get running containers
    $containers = docker ps --format '{{.Names}}|{{.Status}}|{{.Ports}}' | ConvertFrom-Csv -Delimiter '|' -Header 'Name', 'Status', 'Ports'
    
    if (-not $containers) {
        Write-Log "  No containers are running" -Level "WARNING" -Color $Colors.Warning
        return
    }
    
    $containers | ForEach-Object {
        $status = if ($_.Status -like "Up*") {
            "✅ $($_.Status)" 
        } else { 
            "❌ $($_.Status)"
        }
        Write-Host "  $($_.Name.PadRight(20)) $($status.PadRight(30)) $($_.Ports)"
    }
    
    # Show API endpoint
    Write-Host ""
    Write-Host "🌐 Application URLs:" -ForegroundColor $Colors.Info
    Write-Host "  - API Documentation: http://localhost:8000/docs" -ForegroundColor $Colors.Info
    Write-Host "  - Health Check: http://localhost:8000/api/v1/health" -ForegroundColor $Colors.Info
    Write-Host ""
    Write-Host "🔑 Default credentials:" -ForegroundColor $Colors.Info
    Write-Host "  - Database: $($env:POSTGRES_USER)/$($env:POSTGRES_DB)" -ForegroundColor $Colors.Info
    Write-Host "  - Redis password: $($env:REDIS_PASSWORD)" -ForegroundColor $Colors.Info
}

# Main execution
Write-Host ""
Write-Host "========================================" -ForegroundColor $Colors.Info
Write-Host "  $($Config.ProjectName) Deployment" -ForegroundColor $Colors.Info
Write-Host "  Version: $($Config.Version)" -ForegroundColor $Colors.Info
Write-Host "========================================" -ForegroundColor $Colors.Info
Write-Host ""

# Validate environment
Test-Environment

# Set environment variables
Set-EnvironmentVariables

# Start services with default options
try {
    Start-Services -Build -Pull

    # Show service status
    Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
    Write-Host "`n🌐 Services:" -ForegroundColor Cyan
    Write-Host "- Backend API: http://localhost:8000/docs"
    Write-Host "- PostgreSQL: localhost:5432"
    Write-Host "- Redis: localhost:6379"
    Write-Host "`n📝 Note: Make sure to update your frontend to point to the backend API."
} catch {
    Write-Host "`n❌ Deployment failed: $_" -ForegroundColor Red
    exit 1
}
