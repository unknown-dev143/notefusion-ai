@echo off
REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    (
        echo # Database
        echo DATABASE_URL=sqlite+aiosqlite:///./test_notefusion.db
        echo 
        echo # Security
        echo SECRET_KEY=test-secret-key-123
        echo ALGORITHM=HS256
        echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        echo 
        echo # OpenAI
        echo OPENAI_API_KEY=your-test-api-key-here
        echo 
        echo # CORS
        echo FRONTEND_URL=http://localhost:3000
    ) > .env
    echo .env file created. Please update OPENAI_API_KEY with your actual API key.
    pause
) else (
    echo .env file already exists. Using existing configuration.
)

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies. Please check your Python and pip installation.
    pause
    exit /b 1
)

REM Initialize the database
echo Setting up the database...
alembic upgrade head
if %ERRORLEVEL% NEQ 0 (
    echo Failed to set up the database.
    pause
    exit /b 1
)

echo.
echo Setup completed successfully!
echo You can now start the server with: uvicorn app.main:app --reload
echo.
pause
