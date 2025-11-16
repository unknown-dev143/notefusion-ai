@echo off
echo Creating backup of important files...

REM Create backup directory with timestamp
set timestamp=%date:~-4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%
set backup_dir=backup_%timestamp%
mkdir "%backup_dir%" 2>nul

REM Copy important files and directories
xcopy /E /Y /I "docker-compose.yml" "%backup_dir%\"
xcopy /E /Y /I "deploy.ps1" "%backup_dir%\"
xcopy /E /Y /I "backend\app\config" "%backup_dir%\backend\app\config\"
xcopy /E /Y /I "backend\requirements*.txt" "%backup_dir%\backend\"

REM Create a zip of the backup
powershell Compress-Archive -Path "%backup_dir%\*" -DestinationPath "%backup_dir%.zip" -Force

REM Remove the temporary directory
rmdir /S /Q "%backup_dir%"

echo.
echo Backup completed: %backup_dir%.zip
timeout /t 5
