@echo off
echo Setting up NoteFusion AI database...

:: Set environment variables
set DATABASE_URL=sqlite+aiosqlite:///./notefusion.db
echo Using database: %DATABASE_URL%

:: Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo Creating Python virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
)

:: Install required packages
echo Installing dependencies...
pip install -r requirements.txt

:: Run database initialization
echo Initializing database...
python -m scripts.init_database

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database setup completed successfully!
    echo You can now start the application with: python -m uvicorn app.main:app --reload
) else (
    echo.
    echo ❌ Database setup failed. Please check the error messages above.
    exit /b 1
)
