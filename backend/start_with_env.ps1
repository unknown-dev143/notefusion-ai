# Set environment variables for the backend
$env:APP_NAME="NoteFusion"
$env:APP_ENV="development"
$env:DEBUG="True"
$env:SECRET_KEY="your-secret-key-here"
$env:ALGORITHM="HS256"
$env:ACCESS_TOKEN_EXPIRE_MINUTES="30"
$env:DATABASE_URL="sqlite:///./notefusion_new.db"
$env:BACKEND_CORS_ORIGINS='["http://localhost:3000","http://127.0.0.1:3000"]'

# Print environment variables for debugging
Write-Host "Environment variables set:"
Get-ChildItem Env: | Where-Object { $_.Name -like "APP_*" -or $_.Name -like "DATABASE_*" -or $_.Name -like "SECRET_*" -or $_.Name -like "BACKEND_*" }

# Run the server with debug logging
Write-Host "Starting server..."
python -m uvicorn start_server:app --reload --log-level debug
