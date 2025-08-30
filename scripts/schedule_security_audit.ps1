# Script to schedule regular security audits using Windows Task Scheduler
# Run this script as Administrator

# Configuration
$scriptPath = Join-Path $PSScriptRoot "run_security_audit.py"
$pythonPath = "python"  # Update this to the full path if Python is not in PATH
$logDir = Join-Path $PSScriptRoot "..\logs"
$taskName = "NoteFusion Security Audit"

# Create logs directory if it doesn't exist
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Define the scheduled task action
$action = New-ScheduledTaskAction -Execute $pythonPath -Argument $scriptPath -WorkingDirectory $PSScriptRoot

# Set the trigger to run daily at 2 AM
$trigger = New-ScheduledTaskTrigger -Daily -At 2am

# Set settings for the task
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries -RunOnlyIfNetworkAvailable

# Register the scheduled task
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -Force

# Set the task to run whether user is logged on or not
$task = Get-ScheduledTask -TaskName $taskName
$task.Principal.RunLevel = "Highest"
$task.Settings.ExecutionTimeLimit = "PT4H"  # 4 hour timeout
$task.Settings.RestartCount = 3
$task.Settings.RestartInterval = "PT5M"
$task | Set-ScheduledTask

# Create a batch file to run the audit manually
$batchContent = @"
@echo off
echo Running NoteFusion Security Audit...
"$pythonPath" "$scriptPath"
pause
"@

$batchPath = Join-Path $PSScriptRoot "run_audit.bat"
Set-Content -Path $batchPath -Value $batchContent

Write-Host "✅ Security audit task has been scheduled to run daily at 2 AM"
Write-Host "You can also run the audit manually by executing: $batchPath"
