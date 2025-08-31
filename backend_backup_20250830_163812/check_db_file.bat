@echo off
setlocal DisableDelayedExpansion

:: Configuration
set "DB_FILE=notefusion.db"
set "MIN_DB_SIZE=1024"  :: Minimum valid database size in bytes
set "MAX_LOGS=5"        :: Number of log files to keep
set "LOG_DIR=logs"

:: Get current timestamp for log file
for /f "tokens=2 delims==" %%G in ('wmic OS Get localdatetime /value 2^>nul') do set "dt=%%G"
if not defined dt (
    for /f "tokens=2 delims==." %%G in ('wmic OS Get localdatetime /value 2^>nul') do set "dt=%%G"
    if not defined dt set "dt=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
)
set "LOG_FILE=db_check_%dt:~0,4%-%dt:~4,2%-%dt:~6,2%_%dt:~8,2%%dt:~10,2%%dt:~12,2%.log"

:: Create logs directory if it doesn't exist
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

:: Function to log messages
:log
setlocal
set "log_time=%TIME: =0%"
echo [%log_time%] %*
echo [%log_time%] %*>> "%LOG_DIR%\%LOG_FILE%"
endlocal
goto :eof

:: Main execution
(
    setlocal enabledelayedexpansion
    call :log "===== Database Check Started ====="
    call :log "Date: %DATE%"
    call :log "Time: %TIME%"
    call :log "Log file: %LOG_DIR%\%LOG_FILE%"
    
    :: Check if database file exists
    if exist "%DB_FILE%" (
        call :log "Database file exists: %DB_FILE%"
        
        :: Get file info
        for /f "tokens=*" %%F in ('dir /a-d /-c "%DB_FILE%" 2^>nul ^| findstr /i /c:"%DB_FILE%"') do (
            set "file_info=%%F"
        )
        
        if defined file_info (
            for /f "tokens=1-5" %%a in ('echo !file_info!') do (
                set "file_date=%%a %%b"
                set "file_time=%%c"
                set "file_size=%%d"
            )
            
            call :log "  Size: !file_size! bytes"
            call :log "  Modified: !file_date! !file_time!"
            
            :: Check if file size is valid
            if !file_size! LSS %MIN_DB_SIZE% (
                call :log "  WARNING: Database file size is below minimum expected size (%MIN_DB_SIZE% bytes)"
            )
            
            :: Check file integrity (basic check)
            call :log "  Verifying file integrity..."
            certutil -hashfile "%DB_FILE%" MD5 >nul 2>&1
            if !ERRORLEVEL! NEQ 0 (
                call :log "  ERROR: Database file integrity check failed"
                exit /b 1
            ) else (
                call :log "  Database file integrity check passed"
            )
            
            :: Check if file is in use
            call :log "  Checking if database is in use..."
            type "%DB_FILE%" >nul 2>&1
            if !ERRORLEVEL! NEQ 0 (
                call :log "  WARNING: Database file might be locked or in use"
            ) else (
                call :log "  Database file is not locked"
            )
        ) else (
            call :log "  WARNING: Could not retrieve file information"
        )
    ) else (
        call :log "ERROR: Database file not found: %DB_FILE%"
        call :log "Current directory: %CD%"
        call :log "Directory contents:"
        dir /a /b 2>&1
        
        :: Try to create a test file to check write permissions
        set "TEST_FILE=test_write_%RANDOM%.tmp"
        echo Testing write permissions... > "%TEST_FILE%" 2>&1
        if exist "%TEST_FILE%" (
            del /q "%TEST_FILE%" >nul 2>&1
            call :log "  Write test: SUCCESS (can write to directory)"
        ) else (
            call :log "  Write test: FAILED (cannot write to directory)"
        )
        
        exit /b 1
    )
    
    call :log "===== Database Check Completed ====="
    
    :: Clean up old log files
    if exist "%LOG_DIR%\db_check_*.log" (
        for /f "skip=%MAX_LOGS% eol=: delims=" %%F in ('dir /b /o-n /a-d "%LOG_DIR%\db_check_*.log" 2^>nul') do (
            del "%LOG_DIR%\%%F" >nul 2>&1
        )
    )
) >> "%LOG_DIR%\%LOG_FILE%" 2>&1

:: Display the log file
if exist "%LOG_DIR%\%LOG_FILE%" (
    type "%LOG_DIR%\%LOG_FILE%"
    
    :: Pause if not running in CI environment
    if "%CI%"=="" (
        echo.
        echo Log saved to: %LOG_DIR%\%LOG_FILE%
        pause
    )
) else (
    echo ERROR: Failed to create log file
    exit /b 1
)

goto :eof
