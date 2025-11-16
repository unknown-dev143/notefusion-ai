@echo off
echo ===== NoteFusion AI Deployment Setup =====
echo.

:: Check Python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not in PATH. Please install Python 3.8 or later and add it to PATH.
    echo You can download it from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo 1. Creating virtual environment...
python -m venv .venv
if not exist ".venv" (
    echo Failed to create virtual environment
    pause
    exit /b 1
)

call .venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

echo 2. Upgrading pip and setuptools...
python -m pip install --upgrade pip setuptools wheel
if %ERRORLEVEL% NEQ 0 (
    echo Failed to upgrade pip and setuptools
    pause
    exit /b 1
)

echo 3. Installing backend dependencies...
cd backend
pip install -r requirements_light.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo 4. Initializing database...
if exist "notefusion.db" (
    echo Database already exists, skipping initialization
) else (
    echo Creating new SQLite database...
    python -c "open('notefusion.db', 'a').close()"
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create database file
        pause
        exit /b 1
    )
)

echo 5. Running database migrations...
cd backend
alembic upgrade head
if %ERRORLEVEL% NEQ 0 (
    echo Database migration failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo 6. Setting up environment variables...
if not exist ".env" (
    echo Creating .env file with default settings...
    (
        echo # Application Settings
        echo ENVIRONMENT=development
        echo DEBUG=true
        echo SECRET_KEY=your-secret-key-change-in-production
        echo 
        echo # Database Settings (SQLite for development)
        echo DATABASE_URL=sqlite:///./notefusion.db
        echo 
        echo # JWT Settings
        echo JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
        echo JWT_ALGORITHM=HS256
        echo JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
        echo 
        echo # Server Settings
        echo HOST=0.0.0.0
        echo PORT=8000
        echo WORKERS=1
    ) > .env
    echo Created .env file with default settings
) else (
    echo .env file already exists, skipping creation
)

echo.
echo ===== Setup Complete =====
echo.
echo To start the application, run:
echo    .\start_app.bat
echo.
echo Or to start just the backend:
echo    .\start_backend.bat
echo.

echo For development, you can access:
echo - API: http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo - Redoc: http://localhost:8000/redoc
echo.

pause
