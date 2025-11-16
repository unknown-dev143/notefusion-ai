# Start the FastAPI server
Write-Host "Starting NoteFusion AI Backend..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Activate virtual environment
.venv\Scripts\Activate.ps1

# Set environment variables
$env:PYTHONPATH = $PWD

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
