# Create backup directory
$backupDir = "$PWD\frontend_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$frontendDir = "$PWD\frontend"

# Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Files and directories to keep
$keepItems = @(
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "src",
    "public",
    ".env",
    ".env.example",
    ".gitignore"
)

Write-Host "Cleaning frontend directory..." -ForegroundColor Cyan

# Move all items to backup
get-childitem -Path $frontendDir -Exclude $keepItems | ForEach-Object {
    $destination = Join-Path $backupDir $_.Name
    Write-Host "Backing up: $($_.Name)" -ForegroundColor DarkGray
    Move-Item -Path $_.FullName -Destination $destination -Force
}

# Clean up node_modules and build artifacts
$cleanDirs = @("node_modules", "dist", "build", "coverage", ".next", "out")
foreach ($dir in $cleanDirs) {
    $path = Join-Path $frontendDir $dir
    if (Test-Path $path) {
        Write-Host "Removing directory: $dir" -ForegroundColor Yellow
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "`nCleanup completed!" -ForegroundColor Green
Write-Host "Backup created at: $backupDir" -ForegroundColor Cyan
Write-Host "Frontend directory is now clean and ready for deployment." -ForegroundColor Green
