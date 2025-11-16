# Simple Vercel Deployment Script
Write-Host "===== NoteFusion PWA Deployment =====" -ForegroundColor Cyan

# Create dist directory if it doesn't exist
$distPath = ".\dist"
if (-not (Test-Path $distPath)) {
    New-Item -ItemType Directory -Path $distPath | Out-Null
    Write-Host "Created dist directory" -ForegroundColor Green
}

# Copy necessary files to dist
$filesToCopy = @(
    @{Src="simple-test.html"; Dst="index.html"},
    @{Src="simple-sw.js"; Dst="service-worker.js"},
    @{Src="minimal-manifest.json"; Dst="manifest.json"},
    @{Src="vercel.json"; Dst="vercel.json"}
)

foreach ($file in $filesToCopy) {
    $src = $file.Src
    $dst = Join-Path $distPath $file.Dst
    
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "  ✓ Copied $src to dist\$($file.Dst)" -ForegroundColor Green
    } else {
        Write-Host "  ! Warning: $src not found" -ForegroundColor Yellow
    }
}

Write-Host "`n===== Deployment Files Ready =====" -ForegroundColor Cyan
Write-Host "1. Go to https://vercel.com/new"
Write-Host "2. Select 'Import Project'"
Write-Host "3. Drag and drop the 'dist' folder"
Write-Host "4. Click 'Deploy'"
Write-Host "`nOR from the command line (if Vercel CLI is installed):"
Write-Host "1. cd dist"
Write-Host "2. npx vercel --prod"

# Open the dist folder in File Explorer
Start-Process $distPath
