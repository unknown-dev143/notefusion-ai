# Deployment script for NoteFusion PWA
Write-Host "=== NoteFusion PWA Deployment ===" -ForegroundColor Cyan
Write-Host "1. Building production files..."

# Create dist directory if it doesn't exist
$distPath = ".\dist"
if (-not (Test-Path $distPath)) {
    New-Item -ItemType Directory -Path $distPath | Out-Null
}

# Copy necessary files to dist
$filesToCopy = @(
    "simple-test.html",
    "simple-sw.js",
    "minimal-manifest.json",
    "styles.css",
    "vercel.json",
    "netlify.toml"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination "$distPath\$file" -Force
        Write-Host "  ✓ Copied $file" -ForegroundColor Green
    } else {
        Write-Host "  ! Warning: $file not found" -ForegroundColor Yellow
    }
}

Write-Host "`n2. Deployment Options:" -ForegroundColor Cyan
Write-Host "   [1] Vercel (Recommended for PWAs)"
Write-Host "   [2] Netlify"
Write-Host "   [3] GitHub Pages"
Write-Host "   [4] Manual Deployment"

$choice = Read-Host "`nSelect deployment option (1-4)"

switch ($choice) {
    "1" { 
        # Vercel deployment
        Write-Host "`nDeploying to Vercel..." -ForegroundColor Cyan
        if (Get-Command vercel -ErrorAction SilentlyContinue) {
            Set-Location $distPath
            vercel --prod
        } else {
            Write-Host "Vercel CLI not found. Please install it with 'npm install -g vercel'" -ForegroundColor Red
        }
    }
    "2" { 
        # Netlify deployment
        Write-Host "`nDeploying to Netlify..." -ForegroundColor Cyan
        if (Get-Command netlify -ErrorAction SilentlyContinue) {
            Set-Location $distPath
            netlify deploy --prod
        } else {
            Write-Host "Netlify CLI not found. Please install it with 'npm install -g netlify-cli'" -ForegroundColor Red
        }
    }
    "3" { 
        # GitHub Pages
        Write-Host "`nGitHub Pages Deployment Instructions:" -ForegroundColor Cyan
        Write-Host "1. Create a new GitHub repository"
        Write-Host "2. Push your code to the repository"
        Write-Host "3. Go to Settings > Pages"
        Write-Host "4. Select 'main' branch and '/ (root)' folder"
        Write-Host "5. Click 'Save'"
    }
    "4" { 
        # Manual deployment
        Write-Host "`nManual Deployment Instructions:" -ForegroundColor Cyan
        Write-Host "1. Upload the contents of the 'dist' folder to your web server"
        Write-Host "2. Ensure your server serves 'index.html' for all routes (SPA routing)"
        Write-Host "3. Configure HTTPS for PWA installation to work"
        Write-Host "4. Test the service worker registration"
    }
    default { 
        Write-Host "Invalid selection. Please run the script again." -ForegroundColor Red
    }
}

Write-Host "`nDeployment process completed!" -ForegroundColor Green
