# Create test log entries for monitoring
$logDir = "logs"
$logFile = "$logDir\security.log"

# Create logs directory if it doesn't exist
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# Create test log entries
$testLogs = @(
    @{
        timestamp = Get-Date -Format "o"
        level = "WARNING"
        module = "security"
        message = "Rate limit exceeded for IP 192.168.1.1"
    },
    @{
        timestamp = (Get-Date).AddMinutes(-5) | Get-Date -Format "o"
        level = "WARNING"
        module = "moderation"
        message = "Content violation detected: inappropriate language"
    },
    @{
        timestamp = (Get-Date).AddMinutes(-10) | Get-Date -Format "o"
        level = "WARNING"
        module = "auth"
        message = "Failed login attempt for user: admin"
    }
)

# Write test logs to file
$testLogs | ForEach-Object {
    $_ | ConvertTo-Json -Compress | Add-Content -Path $logFile
}

Write-Host "Created test log entries in $logFile" -ForegroundColor Green
Write-Host "You can now run the monitoring script manually to test it:" -ForegroundColor Cyan
Write-Host ".\venv\Scripts\python.exe backend/scripts/monitor_security.py" -ForegroundColor White
