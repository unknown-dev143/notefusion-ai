# Start NoteFusion AI Backend
Write-Host "Starting NoteFusion AI Backend..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Activate virtual environment
$activatePath = ".\.venv\Scripts\Activate.ps1"
if (Test-Path $activatePath) {
    . $activatePath
} else {
    Write-Host "Error: Virtual environment not found. Please run .\fix_environment.ps1 first" -ForegroundColor Red
    exit 1
}

# Set environment variables
$env:PYTHONPATH = $PWD

# Start the server with more verbose output
Write-Host "Starting Uvicorn server..." -ForegroundColor Cyan
uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level debug

# Keep the window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host "\nThe server exited with an error. Press any key to close..." -ForegroundColor Red
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}
