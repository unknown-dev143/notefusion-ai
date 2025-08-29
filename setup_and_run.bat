@echo off
echo Setting up NoteFusion AI...
echo ===========================

REM Activate virtual environment
if exist ".venv\Scripts\activate" (
    echo Activating virtual environment...
    call .venv\Scripts\activate
) else (
    echo Creating virtual environment...
    python -m venv .venv
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
    call .venv\Scripts\activate
)

echo.
echo Installing dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Setting up environment...
if not exist ".env" (
    echo Creating .env file...
    echo # Application Settings > .env
    echo ENV=development >> .env
    echo DEBUG=true >> .env
    echo SECRET_KEY=your-secret-key-here-1234567890abcdef >> .env
    echo. >> .env
    echo # Database >> .env
    echo DATABASE_URL=sqlite+aiosqlite:///./notefusion.db >> .env
    echo. >> .env
    echo # JWT Authentication >> .env
    echo JWT_SECRET_KEY=your-jwt-secret-key-here-1234567890abcdef >> .env
    echo JWT_ALGORITHM=HS256 >> .env
    echo JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440 >> .env
    echo. >> .env
    echo # Admin User >> .env
    echo ADMIN_EMAIL=admin@example.com >> .env
    echo ADMIN_PASSWORD=ChangeThisPassword123! >> .env
)

echo.
echo Initializing database...
python init_db.py
if %ERRORLEVEL% NEQ 0 (
    echo Failed to initialize database
    pause
    exit /b 1
)

echo.
echo Starting NoteFusion AI server...
echo.
echo Access the application at: http://localhost:3000
echo API Documentation: http://localhost:8000/docs
echo.
echo Admin credentials:
echo Email: admin@example.com
echo Password: ChangeThisPassword123!
echo.

python start_server.py

pause
