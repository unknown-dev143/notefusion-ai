# Fresh setup script for NoteFusion AI Backend
Write-Host "🚀 Starting fresh setup for NoteFusion AI Backend..." -ForegroundColor Cyan

# Clean up existing files
Write-Host "🧹 Cleaning up old files..."
Remove-Item -Force -ErrorAction SilentlyContinue test_notefusion.db
Remove-Item -Force -ErrorAction SilentlyContinue -Recurse -Path .\alembic\versions\__pycache__
Remove-Item -Force -ErrorAction SilentlyContinue -Recurse -Path .\__pycache__

# Create uploads directory if it doesn't exist
$uploadDir = ".\uploads"
if (-not (Test-Path -Path $uploadDir)) {
    New-Item -ItemType Directory -Path $uploadDir | Out-Null
    Write-Host "📁 Created uploads directory"
}

# Create .env file if it doesn't exist
$envPath = ".\.env"
if (-not (Test-Path -Path $envPath)) {
    @"
# Database
DATABASE_URL=sqlite+aiosqlite:///./test_notefusion.db

# Security
SECRET_KEY=test-secret-key-123
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI
OPENAI_API_KEY=your-test-api-key-here

# CORS
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath $envPath -Encoding utf8
    
    Write-Host "⚠️  Please update the OPENAI_API_KEY in the .env file" -ForegroundColor Yellow
    notepad.exe .env
}

# Install Python dependencies
Write-Host "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

if (-not $?) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Install additional required packages
Write-Host "🔧 Installing additional packages..."
pip install openai>=1.12.0 python-multipart

# Initialize the database
Write-Host "💾 Setting up database..."
$env:DATABASE_URL = "sqlite+aiosqlite:///./test_notefusion.db"

# Run migrations
try {
    $alembicOutput = alembic upgrade head 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to run database migrations" -ForegroundColor Red
        Write-Host $alembicOutput
        exit 1
    }
} catch {
    Write-Host "❌ Error running migrations: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✨ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure you've updated the OPENAI_API_KEY in the .env file"
Write-Host "2. To start the server: python -m uvicorn app.main:app --reload"
Write-Host "3. Access the API docs at: http://localhost:8000/docs"
Write-Host "4. Run tests with: python test_notes.py"

# Keep the window open
Write-Host ""
Read-Host -Prompt "Press Enter to exit"
