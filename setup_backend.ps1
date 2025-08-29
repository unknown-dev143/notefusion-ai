# Setup script for NoteFusion AI Backend
Write-Host "Setting up NoteFusion AI Backend..." -ForegroundColor Green

# Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not installed or not in PATH. Please install Python 3.8+ first." -ForegroundColor Red
    Start-Process "https://www.python.org/downloads/"
    exit 1
}

# Create and activate virtual environment
if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv .venv
}

# Activate venv
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
.venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Cyan
python -m pip install --upgrade pip

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
pip install fastapi uvicorn python-dotenv sqlalchemy passlib[bcrypt] python-jose[cryptography] python-multipart pydantic[email] alembic

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    @"
# ====================================
# Application
# ====================================
ENVIRONMENT=development
HOST=0.0.0.0
PORT=5000
WORKERS=4
LOG_LEVEL=info

# Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# ====================================
# Database
# ====================================
# SQLite (Development)
DATABASE_URL=sqlite+aiosqlite:///./notefusion.db

# PostgreSQL (Production)
# DATABASE_URL=postgresql+asyncpg://user:password@localhost/notefusion

# ====================================
# JWT Authentication
# ====================================
SECRET_KEY=your-secret-key-123
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
"@ | Out-File -FilePath .env -Encoding utf8
}

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Cyan
python init_db.py

Write-Host ""
Write-Host "Backend setup complete!" -ForegroundColor Green
Write-Host "To start the server, run: .\run.ps1" -ForegroundColor Yellow
