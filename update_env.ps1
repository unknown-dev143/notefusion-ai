# Update environment variables for monitoring
$envFile = ".env"
$monitoringConfig = @"

# Monitoring Configuration
SMTP_SERVER=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
ALERT_EMAIL=admin@example.com

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/security_monitor.log
"@

# Check if .env exists
if (Test-Path $envFile) {
    # Backup existing .env
    $backupFile = ".env.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $envFile $backupFile
    Write-Host "Created backup of existing .env file: $backupFile" -ForegroundColor Yellow
    
    # Append monitoring config
    Add-Content -Path $envFile -Value $monitoringConfig
    Write-Host "Updated .env with monitoring configuration" -ForegroundColor Green
} else {
    # Create new .env with monitoring config
    Set-Content -Path $envFile -Value $monitoringConfig
    Write-Host "Created new .env file with monitoring configuration" -ForegroundColor Green
}

Write-Host "`nPlease update the SMTP settings in the .env file with your email provider's details." -ForegroundColor Cyan
Write-Host "File location: $(Resolve-Path $envFile)" -ForegroundColor Cyan
