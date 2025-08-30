# Create backup directory
$backupDir = "$PWD\backend_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$backendDir = "$PWD\backend"

# Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Files and directories to keep
$keepItems = @(
    "app",
    "alembic",
    "migrations",
    "requirements.txt",
    "requirements-dev.txt",
    ".env",
    ".env.example",
    ".gitignore",
    "alembic.ini"
)

Write-Host "Cleaning backend directory..." -ForegroundColor Cyan

# Move all items to backup
get-childitem -Path $backendDir -Exclude $keepItems | ForEach-Object {
    $destination = Join-Path $backupDir $_.Name
    Write-Host "Backing up: $($_.Name)" -ForegroundColor DarkGray
    Move-Item -Path $_.FullName -Destination $destination -Force
}

# Clean up Python cache and build artifacts
$cleanDirs = @("__pycache__", ".pytest_cache", ".mypy_cache", ".coverage", "htmlcov", "dist", "build", "*.egg-info")
foreach ($dir in $cleanDirs) {
    Get-ChildItem -Path $backendDir -Include $dir -Directory -Recurse | ForEach-Object {
        Write-Host "Removing directory: $($_.FullName)" -ForegroundColor Yellow
        Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Clean up Python cache files
$cleanFiles = @("*.pyc", "*.pyo", "*.pyd", "*.py~")
foreach ($file in $cleanFiles) {
    Get-ChildItem -Path $backendDir -Include $file -File -Recurse | ForEach-Object {
        Write-Host "Removing file: $($_.FullName)" -ForegroundColor DarkYellow
        Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "`nBackend cleanup completed!" -ForegroundColor Green
Write-Host "Backup created at: $backupDir" -ForegroundColor Cyan
Write-Host "Backend directory is now clean and ready for deployment." -ForegroundColor Green
