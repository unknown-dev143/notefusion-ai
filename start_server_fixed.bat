@echo off
echo === Starting NoteFusion AI Server ===
echo.

:: Check Python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Activate virtual environment
if not exist ".venv\" (
    echo Creating virtual environment...
    python -m venv .venv
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call .venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

:: Install requirements
echo Installing requirements...
pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install requirements
    pause
    exit /b 1
)

:: Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    (
        echo # Application Settings
        echo ENV=development
        echo DEBUG=true
        echo SECRET_KEY=your-secret-key-123
        echo.
        echo # Database
        echo DATABASE_URL=sqlite+aiosqlite:///./notefusion.db
        echo.
        echo # JWT
        echo JWT_SECRET_KEY=your-jwt-secret-123
        echo JWT_ALGORITHM=HS256
        echo JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
        echo.
        echo # Admin
        echo ADMIN_EMAIL=admin@example.com
        echo ADMIN_PASSWORD=ChangeThis123!
    ) > .env
)

:: Initialize database
echo Initializing database...
python -c "
import sys
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import hashlib
import secrets

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Create tables
Base.metadata.create_all(bind=engine)
print('Database initialized successfully')
"

:: Start the server
echo Starting FastAPI server...
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
