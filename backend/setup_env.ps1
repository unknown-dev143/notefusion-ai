# Create .env file with default settings
$envContent = @"
# Application
APP_NAME=NoteFusion
APP_ENV=development
DEBUG=True

# Security
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL=sqlite:///./notefusion.db

# First Superuser
FIRST_SUPERUSER=admin@notefusion.app
FIRST_SUPERUSER_PASSWORD=changeme

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:4001,http://127.0.0.1:3000,http://127.0.0.1:4001

# Rate Limiting
RATE_LIMIT=100/minute

# WebSockets
WS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4001
"@

# Write to .env file
$envContent | Out-File -FilePath ".\.env" -Encoding utf8

Write-Host "Environment file (.env) has been created successfully in the backend directory." -ForegroundColor Green
Write-Host "Please review the configuration and update any values as needed." -ForegroundColor Yellow
