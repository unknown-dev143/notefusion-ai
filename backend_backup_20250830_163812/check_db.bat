@echo off
echo Checking database file...
echo.

if exist notefusion.db (
    echo ✅ Database file exists
    echo Size: %~z0 bytes
) else (
    echo ❌ Database file does not exist
)

echo.
echo Current directory: %CD%
echo.
dir /a

echo.
pause
