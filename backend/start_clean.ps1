# Stop any running Python processes
Write-Host "Stopping any running Python processes..."
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove existing database file
$dbPath = "./notefusion.db"
if (Test-Path $dbPath) {
    Write-Host "Removing existing database..."
    Remove-Item $dbPath -Force
}

# Set environment variables
$env:APP_ENV = "development"
$env:APP_NAME = "NoteFusion"
$env:SECRET_KEY = "your-secret-key-here"
$env:ALGORITHM = "HS256"
$env:ACCESS_TOKEN_EXPIRE_MINUTES = "30"
$env:REFRESH_TOKEN_EXPIRE_DAYS = "7"
$env:BACKEND_CORS_ORIGINS = '["http://localhost:3000","http://localhost:8000"]'

# Start the server with detailed logging
Write-Host "Starting server with detailed logging..."
python -u start_server.py 2>&1 | Tee-Object -FilePath "./server.log"

# Keep the window open to see any errors
Write-Host "Server stopped. Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
