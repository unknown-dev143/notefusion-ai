@echo off
setlocal enabledelayedexpansion

:: Create backups directory if it doesn't exist
if not exist backups mkdir backups

:: Get current date and time
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=!dt:~0,4!-!dt:~4,2!-!dt:~6,2!_!dt:~8,2!-!dt:~10,2!-!dt:~12,2!"

:: Set backup filename
set "backup_file=backups\notefusion_db_!timestamp!.db"

:: Copy the database file
copy notefusion.db "!backup_file!" >nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ Database backed up to !backup_file!
) else (
    echo ❌ Failed to back up database
    exit /b 1
)

endlocal
