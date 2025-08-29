# Run FastAPI application with proper environment setup

# Set environment variables
$env:PYTHONPATH = "."

# Start the FastAPI server
Write-Host "Starting FastAPI server..." -ForegroundColor Cyan
uvicorn minimal_app:app --host 0.0.0.0 --port 5000 --reload
