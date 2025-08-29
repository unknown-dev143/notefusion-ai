# Start the FastAPI server
Write-Host "Starting NoteFusion AI Backend..." -ForegroundColor Green

# Activate virtual environment
if (Test-Path ".venv\Scripts\Activate.ps1") {
    .\.venv\Scripts\Activate.ps1
}

# Set environment variables
$env:PYTHONPATH = "."

# Start the server
Write-Host "Starting FastAPI server..." -ForegroundColor Cyan
uvicorn minimal_app:app --host 0.0.0.0 --port 5000 --reload
