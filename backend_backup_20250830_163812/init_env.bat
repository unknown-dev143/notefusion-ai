@echo off
echo ============================================
echo NoteFusion AI - Environment Setup and Test

:: Check Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to your PATH
    pause
    exit /b 1
)

python --version
echo.

:: Create virtual environment
echo Creating virtual environment...
python -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to create virtual environment
    pause
    exit /b 1
)

:: Activate and install dependencies
echo Activating virtual environment...
call venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)

echo Upgrading pip...
python -m pip install --upgrade pip
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to upgrade pip
    pause
    exit /b 1
)

echo Installing dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

:: Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    (
        echo # Database
        echo DATABASE_URL=sqlite+aiosqlite:///./test_notefusion.db
        echo.
        echo # Security
        echo SECRET_KEY=test-secret-key-123
        echo ALGORITHM=HS256
        echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        echo.
        echo # OpenAI
        echo OPENAI_API_KEY=your-test-api-key-here
        echo.
        echo # CORS
        echo FRONTEND_URL=http://localhost:3000
    ) > .env
    echo.
    echo ⚠️  Please update the OPENAI_API_KEY in the .env file
    echo.
    pause
)

:: Run database migrations
echo Running database migrations...
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
