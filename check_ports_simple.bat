@echo off
echo Checking required ports...
echo ========================
echo.

for %%p in (3001, 9090, 8080) do (
    netstat -ano | findstr ":%%p" >nul
    if errorlevel 1 (
        echo Port %%p is available
    ) else (
        echo Port %%p is in use
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p"') do (
            tasklist /fi "pid eq %%a" /fo table /nh
        )
    )
)

echo.
pause
