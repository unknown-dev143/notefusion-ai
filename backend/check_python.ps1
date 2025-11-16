Write-Host "=== Python Environment Check ==="
Write-Host "Current directory: $(Get-Location)"

# Check Python executable
$pythonPath = "..\venv\Scripts\python.exe"
if (-not (Test-Path $pythonPath)) {
    Write-Host "Python executable not found at $pythonPath"
    exit 1
}
Write-Host "Python found at: $pythonPath"

# Run a simple Python command
$output = & $pythonPath -c "import sys; print(f'Python {sys.version}'); print(f'Executable: {sys.executable}'); print('Hello from Python')" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Python command executed successfully:"
    $output
} else {
    Write-Host "Error executing Python command:"
    $output
}
