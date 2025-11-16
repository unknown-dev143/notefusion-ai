# Check Node.js installation
Write-Host "🔍 Checking Node.js installation..." -ForegroundColor Cyan

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Check Node.js
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if ($nodePath) {
    Write-Host "✅ Node.js is installed at: $nodePath" -ForegroundColor Green
    Write-Host "   Version: $(node --version)" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
}

# Check npm
$npmPath = (Get-Command npm -ErrorAction SilentlyContinue).Source
if ($npmPath) {
    Write-Host "✅ npm is installed at: $npmPath" -ForegroundColor Green
    Write-Host "   Version: $(npm --version)" -ForegroundColor Green
} else {
    Write-Host "❌ npm is not installed or not in PATH" -ForegroundColor Red
}

# Check common installation paths
$commonPaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\nvm\v22.18.0\node.exe",
    "$env:LOCALAPPDATA\nvm\v22.18.0\node.exe"
)

Write-Host "\n🔍 Checking common installation paths..." -ForegroundColor Cyan
$found = $false
foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Found Node.js at: $path" -ForegroundColor Green
        $found = $true
    }
}

if (-not $found) {
    Write-Host "❌ Node.js not found in common locations" -ForegroundColor Red
}

# Check environment variables
Write-Host "\n🔍 Checking environment variables..." -ForegroundColor Cyan
$path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
if ($path -like "*nodejs*") {
    Write-Host "✅ Node.js is in PATH" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not in PATH" -ForegroundColor Red
}

# Installation instructions if not found
if (-not $nodePath) {
    Write-Host "\n📥 Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "   - Download the LTS version" -ForegroundColor Yellow
    Write-Host "   - Run the installer" -ForegroundColor Yellow
    Write-Host "   - Make sure to check 'Add to PATH' during installation" -ForegroundColor Yellow
}

Write-Host "\nPress any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
