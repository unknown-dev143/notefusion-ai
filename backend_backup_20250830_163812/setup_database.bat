@echo off
echo Setting up NoteFusion AI database...

:: Create database directory if it doesn't exist
if not exist .\db mkdir .\db

:: Set environment variables
set DATABASE_URL=sqlite+aiosqlite:///./db/notefusion.db
echo Using database: %DATABASE_URL%

:: Run migrations
echo.
echo Running database migrations...
python run_migrations.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Database migration failed.
    exit /b 1
)

echo.
echo ✅ Database setup completed successfully!
echo You can now start the application with: python -m uvicorn app.main:app --reload
echo.
pause
