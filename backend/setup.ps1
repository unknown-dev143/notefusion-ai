# Setup script for NoteFusion AI Backend
Write-Host "🚀 Setting up NoteFusion AI Backend..." -ForegroundColor Cyan

# Create .env file if it doesn't exist
$envPath = ".\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "📝 Creating .env file..."
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
    
    Write-Host "⚠️  Please update the OPENAI_API_KEY in the .env file with your actual API key" -ForegroundColor Yellow
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
alembic upgrade head

if (-not $?) {
    Write-Host "❌ Failed to set up database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✨ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure you've updated the OPENAI_API_KEY in the .env file"
Write-Host "2. To start the server, run: uvicorn app.main:app --reload"
Write-Host "3. Access the API docs at: http://localhost:8000/docs"
Write-Host "4. Run tests with: python test_notes.py"

# Keep the window open
Write-Host ""
Read-Host -Prompt "Press Enter to exit"
