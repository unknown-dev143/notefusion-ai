# Backup environment variables script
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "$PSScriptRoot\..\backups\env_backups"
$envFile = "$PSScriptRoot\..\backend\.env"

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Create backup with timestamp
$backupFile = "${backupDir}\.env.backup_${timestamp}"
Copy-Item -Path $envFile -Destination $backupFile

Write-Host "Backup created: $backupFile"
