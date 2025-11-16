# Set environment variables for the backend
$env:APP_NAME="NoteFusion"
$env:APP_ENV="development"
$env:DEBUG="True"
$env:SECRET_KEY="your-secret-key-here"
$env:ALGORITHM="HS256"
$env:ACCESS_TOKEN_EXPIRE_MINUTES="30"
$env:DATABASE_URL="sqlite:///./notefusion_new.db"
$env:BACKEND_CORS_ORIGINS='["http://localhost:3000","http://127.0.0.1:3000"]'

# Run the server
python start_server.py
