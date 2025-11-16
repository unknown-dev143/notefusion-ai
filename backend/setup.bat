@echo off
setlocal enabledelayedexpansion

echo ⚙️ Setting up NoteFusion Backend...
echo ===================================

:: Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is not installed or not in PATH
    exit /b 1
)

echo ✅ Python is installed

:: Create virtual environment
echo.
echo 🛠 Creating virtual environment...
python -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to create virtual environment
    exit /b 1
)

echo ✅ Virtual environment created

:: Activate virtual environment and install dependencies
echo.
echo 📦 Installing dependencies...
call venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo ✅ Dependencies installed

:: Create .env file if it doesn't exist
if not exist .env (
    echo.
    echo 🔧 Creating .env file...
    copy .env.example .env >nul
    echo ℹ️ Please edit the .env file with your configuration
)

:: Initialize database
echo.
echo 🗄 Initializing database...
python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to initialize database
    exit /b 1
)

echo ✅ Database initialized

:: Create admin user
echo.
echo 👤 Creating admin user...
python -c "from init_admin import *; create_admin_user()"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to create admin user
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo To start the development server, run:
echo    .\start-dev.bat
echo.
echo Then open http://localhost:8000 in your browser
echo.

endlocal
