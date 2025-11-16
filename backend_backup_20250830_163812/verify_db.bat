@echo off
echo Verifying database...
echo.

if not exist notefusion.db (
    echo ❌ Database file not found!
    exit /b 1
)

echo ✅ Database file exists
echo.

echo 📋 Checking tables...
sqlite3 notefusion.db ".tables"

echo.
echo 📋 User AI Settings table:
sqlite3 notefusion.db "PRAGMA table_info(user_ai_settings);"

echo.
echo 📋 Sample data from user_ai_settings:
sqlite3 notefusion.db "SELECT * FROM user_ai_settings LIMIT 5;"

echo.
pause
