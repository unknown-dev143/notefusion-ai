# Run basic environment checks
Write-Host "=== Python Environment Check ===" -ForegroundColor Cyan
$pythonVersion = python --version
Write-Host "Python Version: $pythonVersion"

Write-Host "`n=== Running Basic Test ===" -ForegroundColor Cyan
python -c "print('Hello from Python!')"

Write-Host "`n=== Running Pytest ===" -ForegroundColor Cyan
$testResult = python -m pytest tests/test_basic.py -v 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Tests ran successfully!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Tests failed with exit code $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Test Output:"
    $testResult
}
