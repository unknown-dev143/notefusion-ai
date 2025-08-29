Write-Host "=== Python Environment Diagnostics ===`n"

# Check Python installation
$pythonVersions = @("python3", "python", "py")
$foundPython = $false

Write-Host "Checking for Python installation..."
foreach ($py in $pythonVersions) {
    $pythonPath = Get-Command $py -ErrorAction SilentlyContinue
    if ($pythonPath) {
        $pythonExe = $pythonPath.Source
        $version = & $pythonExe --version 2>&1
        Write-Host "✅ Found Python at: $pythonExe"
        Write-Host "   $version"
        $foundPython = $true
        break
    }
}

if (-not $foundPython) {
    Write-Host "❌ Python not found in PATH. Please install Python 3.7 or later."
    exit 1
}

# Check pip installation
Write-Host "`nChecking pip installation..."
$pipVersion = & $pythonExe -m pip --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ $pipVersion"
} else {
    Write-Host "❌ pip not found. Attempting to install pip..."
    try {
        & $pythonExe -m ensurepip --default-pip
        if ($LASTEXITCODE -ne 0) { throw "Failed to install pip" }
        Write-Host "✅ pip installed successfully"
    } catch {
        Write-Host "❌ Failed to install pip. Please install pip manually."
        exit 1
    }
}

# Install test dependencies
Write-Host "`nInstalling test dependencies..."
& $pythonExe -m pip install pytest pytest-asyncio
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install test dependencies"
    exit 1
}
Write-Host "✅ Dependencies installed successfully"

# Run tests
Write-Host "`nRunning tests..."
Push-Location $PSScriptRoot
$testOutput = & $pythonExe -m pytest backend/test_audio_services.py -v 2>&1 | Out-String
Pop-Location

Write-Host "`n=== Test Output ===`n"
Write-Host $testOutput
