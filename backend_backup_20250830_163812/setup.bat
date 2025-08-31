@echo off
echo ============================================
echo NoteFusion AI - Setup Script
echo ============================================

:: Check Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to your PATH
    pause
    exit /b 1
)

echo [1/5] 🐍 Checking Python version...
python --version

:: Create virtual environment if it doesn't exist
if not exist "venv" (
    echo [2/5] 🛠️  Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
) else (
    echo [2/5] ✅ Virtual environment already exists
)

:: Activate virtual environment
call venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)

echo [3/5] 🔄 Upgrading pip...
python -m pip install --upgrade pip
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to upgrade pip
    pause
    exit /b 1
)

echo [4/5] 📦 Installing dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo [5/5] 💾 Setting up database...

:: Create uploads directory if it doesn't exist
if not exist "uploads" (
    mkdir uploads
    echo Created uploads directory
)

:: Set environment variables
set DATABASE_URL=sqlite+aiosqlite:///./test_notefusion.db

:: Run database migrations
alembic upgrade head
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to run database migrations
    pause
    exit /b 1
)

echo.
echo ============================================
echo ✅ Setup completed successfully!
echo.
echo Next steps:
echo 1. Edit .env and add your OpenAI API key
echo 2. To start the server: python -m uvicorn app.main:app --reload
echo 3. Access the API docs at: http://localhost:8000/docs
echo 4. Run tests with: python test_notes.py
echo.
pause
