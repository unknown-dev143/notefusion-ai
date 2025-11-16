@echo off
REM Setup script for NoteFusion AI Backend

echo =======================================
echo NoteFusion AI - Backend Setup
echo =======================================

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

echo [1/6] Creating virtual environment...
python -m venv .venv
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create virtual environment.
    pause
    exit /b 1
)

REM Activate the virtual environment
call .venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to activate virtual environment.
    pause
    exit /b 1
)

echo [2/6] Upgrading pip and setuptools...
python -m pip install --upgrade pip setuptools wheel
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Failed to upgrade pip and setuptools. Continuing...
)

echo [3/6] Installing dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo [4/6] Creating .env file...
    copy .env.example .env >nul
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Failed to create .env file. Creating empty one...
        echo # NoteFusion AI Environment Variables > .env
        echo DATABASE_URL=sqlite+aiosqlite:///./notefusion.db >> .env
        echo SECRET_KEY=change_this_to_a_secure_secret_key >> .env
    )
    echo Please edit the .env file with your configuration.
) else (
    echo [4/6] .env file already exists.
)

echo [5/6] Setting up database...
python -c "from app.models.database import Base, engine; Base.metadata.create_all(bind=engine)"
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database setup completed with warnings.
)

echo [6/6] Starting development server...
echo.
echo =======================================
echo Setup complete! Starting development server...
echo Press Ctrl+C to stop the server.
echo =======================================
echo.

uvicorn app.main:app --reload

pause
