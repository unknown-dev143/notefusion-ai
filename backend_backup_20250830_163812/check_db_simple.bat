@echo off
echo Checking database...
echo.

:: Check if SQLite3 is available
where sqlite3 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ SQLite3 is not in your PATH. Please install SQLite or add it to your PATH.
    exit /b 1
)

:: Check if database file exists
if not exist notefusion.db (
    echo ❌ Database file not found: notefusion.db
    echo.
    echo Please run database migrations first.
    exit /b 1
)

echo ✅ Database file exists: notefusion.db
echo.

echo 📋 Listing all tables...
sqlite3 notefusion.db ".tables"

echo.
echo 📋 Showing schema for all tables...
sqlite3 notefusion.db ".schema"

echo.
echo 🏁 Script completed. Press any key to exit.
pause >nul
