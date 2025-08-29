# Test Python Environment
Write-Host "=== Python Environment Test ===`n"

# Check Python version
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python is not in PATH or not installed"
    Write-Host "Please install Python 3.8 or later from https://www.python.org/downloads/"
    exit 1
}
Write-Host "✅ Python Version: $pythonVersion"

# Check Python executable path
$pythonPath = (Get-Command python).Source
Write-Host "✅ Python Path: $pythonPath"

# Create a simple test script
$testScript = @"
import sys
print("Python is working!")
print(f"Version: {sys.version}")
print(f"Executable: {sys.executable}")
"@

$testScriptPath = "test_python_env.py"
$testScript | Out-File -FilePath $testScriptPath -Encoding utf8

# Run the test script
Write-Host "`nRunning test script...`n"
try {
    $output = python $testScriptPath 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test script executed successfully:`n" -ForegroundColor Green
        $output
    } else {
        Write-Host "❌ Test script failed with error:" -ForegroundColor Red
        $output
    }
} catch {
    Write-Host "❌ Error running test script: $_" -ForegroundColor Red
}

# Clean up
Remove-Item $testScriptPath -ErrorAction SilentlyContinue

# Keep the window open
Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

exit 0
