# Setup Monitoring Script

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "This script requires administrator privileges. Please run as administrator." -ForegroundColor Red
    exit 1
}

# Paths
$projectRoot = Split-Path -Parent $PSScriptRoot
$pythonPath = "$projectRoot\venv\Scripts\python.exe"
$scriptPath = "$projectRoot\backend\scripts\monitor_security.py"
$logDir = "$projectRoot\logs"

# Create logs directory if it doesn't exist
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
    Write-Host "Created logs directory at $logDir" -ForegroundColor Green
}

# Create scheduled task
$action = New-ScheduledTaskAction -Execute $pythonPath -Argument $scriptPath -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -Daily -At 9am
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries

# Register the task
Register-ScheduledTask -TaskName "NoteFusion Security Monitor" -Action $action -Trigger $trigger -Settings $settings -Description "Monitors NoteFusion AI for security events" -RunLevel Highest -Force

Write-Host "Scheduled task 'NoteFusion Security Monitor' created successfully!" -ForegroundColor Green
Write-Host "It will run daily at 9 AM." -ForegroundColor Yellow

# Instructions for manual testing
Write-Host "`nTo test the monitoring script manually, run:" -ForegroundColor Cyan
Write-Host "$pythonPath $scriptPath" -ForegroundColor White

# Create a test log entry for verification
$testLog = @{
    timestamp = Get-Date -Format "o"
    level = "WARNING"
    module = "security"
    message = "Test security event - this is a test entry"
} | ConvertTo-Json -Compress

Add-Content -Path "$logDir\security.log" -Value $testLog
Write-Host "`nAdded test log entry to $logDir\security.log" -ForegroundColor Green
