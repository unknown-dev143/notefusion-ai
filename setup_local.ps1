# Local Development Setup Script for NoteFusion AI
# Run this in PowerShell as Administrator

# Check for admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "This script requires Administrator privileges. Please run PowerShell as Administrator." -ForegroundColor Red
    exit 1
}

# Install Chocolatey if not installed
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User") 
}

# Install required software
$packages = @(
    "python311",
    "postgresql",
    "redis",
    "nodejs-lts",
    "git"
)

Write-Host "Installing required packages..."
foreach ($package in $packages) {
    choco install $package -y
}

# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Create Python virtual environment
Write-Host "Setting up Python virtual environment..."
$venvPath = ".\venv"
python -m venv $venvPath
.\venv\Scripts\activate

# Install Python dependencies
Write-Host "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install Node.js dependencies
Write-Host "Installing Node.js dependencies..."
cd frontend
npm install
npm run build
cd ..

# Initialize database
Write-Host "Setting up PostgreSQL database..."
$dbUser = "notefusion"
$dbPassword = "notefusion123"
$dbName = "notefusion_dev"

# Create database and user
$env:PGPASSWORD = "postgres"  # Default PostgreSQL password
psql -U postgres -c "CREATE USER $dbUser WITH PASSWORD '$dbPassword';"
psql -U postgres -c "CREATE DATABASE $dbName OWNER $dbUser;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;"

# Create .env file
Write-Host "Creating .env file..."
@"
# Database
DATABASE_URL=postgresql+asyncpg://$dbUser`:$dbPassword@localhost/$dbName

# App Settings
SECRET_KEY=$(New-Guid)
DEBUG=True

# Redis
REDIS_URL=redis://localhost:6379/0
"@ | Out-File -FilePath ".\.env" -Encoding utf8

Write-Host """

=== Setup Complete! ===

Next steps:
1. Initialize the database:
   python -m alembic upgrade head

2. Start Redis:
   Start-Service redis

3. Start the backend:
   .\venv\Scripts\activate
   uvicorn app.main:app --reload

4. In a new terminal, start the frontend:
   cd frontend
   npm start

Access the application at: http://localhost:3000
"""
