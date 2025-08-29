@echo off
echo === Setting up NoteFusion AI Authentication ===
echo.

:: Check Python version
echo Checking Python version...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8 or later from https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Create virtual environment
echo.
echo Creating virtual environment...
python -m venv .venv
if not exist ".venv\" (
    echo Failed to create virtual environment
    pause
    exit /b 1
)

:: Activate virtual environment
echo.
echo Activating virtual environment...
call .venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

:: Install required packages
echo.
echo Installing required packages...
pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install required packages
    pause
    exit /b 1
)

:: Create .env file if it doesn't exist
echo.
echo Checking environment configuration...
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
    echo. >> .env
    echo # OpenAI (optional) >> .env
    echo OPENAI_API_KEY=your-openai-api-key-here >> .env
    echo. >> .env
    echo # Firebase (optional) >> .env
    echo FIREBASE_API_KEY=your-firebase-api-key >> .env
    echo FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com >> .env
    echo FIREBASE_PROJECT_ID=your-project-id >> .env
    echo FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com >> .env
    echo FIREBASE_MESSAGING_SENDER_ID=your-sender-id >> .env
    echo FIREBASE_APP_ID=your-app-id >> .env
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit the .env file with your configuration
echo 2. Run: .\.venv\Scripts\activate
echo 3. Run: python init_db.py
echo 4. Run: python start_server.py
echo.
pause
