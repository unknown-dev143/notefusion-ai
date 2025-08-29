Write-Host "===== Python Environment Check ====="
Write-Host ""

# Check if Python is in PATH
$pythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source
if ($pythonPath) {
    Write-Host "Python found at: $pythonPath"
    $version = & python --version 2>&1
    Write-Host "Python Version: $version"
} else {
    Write-Host "Python not found in PATH"
}

# Check common Python installation directories
Write-Host ""
Write-Host "Checking common Python installation directories..."
$pythonDirs = @(
    "${env:ProgramFiles}\Python*",
    "${env:ProgramFiles(x86)}\Python*",
    "${env:LocalAppData}\Programs\Python\Python*"
)

$found = $false
foreach ($dir in $pythonDirs) {
    $pythonExe = Get-Item -Path $dir\python.exe -ErrorAction SilentlyContinue
    if ($pythonExe) {
        $found = $true
        Write-Host "Found Python at: $($pythonExe.FullName)"
        $version = & $pythonExe.FullName --version 2>&1
        Write-Host "Version: $version"
    }
}

if (-not $found) {
    Write-Host "Python not found in common installation directories"
}

Write-Host ""
Write-Host "Environment check complete"
Write-Host ""

if (-not $pythonPath) {
    Write-Host "To fix Python not being found:"
    Write-Host "1. Download and install Python from https://www.python.org/downloads/"
    Write-Host "2. During installation, check 'Add Python to PATH'"
    Write-Host "3. Open a new terminal and try again"
}

Pause
