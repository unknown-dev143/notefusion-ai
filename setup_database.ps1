# Setup database for NoteFusion AI
Write-Host "🚀 Setting up NoteFusion AI database..." -ForegroundColor Cyan

# 1. Create virtual environment if it doesn't exist
$venvPath = ".\venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "🔧 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv $venvPath
}

# 2. Activate virtual environment
$activatePath = ".\venv\Scripts\Activate.ps1"
if (Test-Path $activatePath) {
    . $activatePath
} else {
    Write-Host "❌ Could not find virtual environment activation script" -ForegroundColor Red
    exit 1
}

# 3. Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pip install -e .
pip install alembic sqlalchemy asyncio pydantic[email] python-jose[cryptography] passlib[bcrypt] python-multipart

# 4. Run migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
$env:PYTHONPATH = $PWD
python -c "
import asyncio
from app.core.database import init_db, close_db
from app.core.config import settings

async def setup():
    print('Initializing database...')
    await init_db()
    print('Database initialized')
    await close_db()

asyncio.run(setup())
"

# 5. Run migrations with Alembic
alembic upgrade head

# 6. Initialize data
Write-Host "📊 Initializing database with sample data..." -ForegroundColor Yellow
python -c "
import asyncio
from app.core.database import init_db, close_db
from app.core.config import settings
from app.models.user import User
from app.core.security import get_password_hash

async def create_initial_data():
    await init_db()
    # Create admin user if it doesn't exist
    admin = await User.get_by_email('admin@example.com')
    if not admin:
        admin = User(
            email='admin@example.com',
            username='admin',
            hashed_password=get_password_hash('admin123'),
            is_superuser=True,
            is_verified=True
        )
        await admin.save()
        print('✅ Created admin user: admin@example.com / admin123')
    
    await close_db()

asyncio.run(create_initial_data())
"

Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
Write-Host "`nYou can now start the application with: python -m uvicorn app.main:app --reload" -ForegroundColor Cyan
Write-Host "`nAdmin credentials:" -ForegroundColor Cyan
Write-Host "  Email: admin@example.com" -ForegroundColor Cyan
Write-Host "  Password: admin123" -ForegroundColor Cyan

# Pause to see the output
Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
