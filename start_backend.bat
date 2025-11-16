@echo off
echo Starting Backend Server...
cd backend

:: Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    echo # Application Settings > .env
    echo ENV=development >> .env
    echo DEBUG=true >> .env
    echo SECRET_KEY=your-secret-key-123 >> .env
    echo. >> .env
    echo # Database >> .env
    echo DATABASE_URL=sqlite+aiosqlite:///./notefusion.db >> .env
    echo. >> .env
    echo # JWT >> .env
    echo JWT_SECRET_KEY=your-jwt-secret-123 >> .env
    echo JWT_ALGORITHM=HS256 >> .env
    echo JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440 >> .env
    echo. >> .env
    echo # Admin User >> .env
    echo ADMIN_EMAIL=admin@example.com >> .env
    echo ADMIN_PASSWORD=ChangeThis123! >> .env
)

:: Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

:: Initialize database
echo Initializing database...
python ../init_db.py

:: Start the server
echo Starting FastAPI server...
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
