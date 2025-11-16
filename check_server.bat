@echo off
echo Checking FastAPI server status...
echo.

echo === Checking for running Python processes ===
tasklist | findstr /i "python"

echo.
echo === Testing common server ports ===

set PORTS=5000 8000 8080 3000

for %%p in (%PORTS%) do (
    echo.
    echo Testing port %%p...
    curl -s -o nul -w "%%{http_code}" -m 1 http://localhost:%%p
    if !errorlevel! equ 0 (
        echo.  Port %%p is responding!
        echo Try opening in browser: http://localhost:%%p
    ) else (
        echo.  No response on port %%p
    )
)

echo.
echo If no ports are responding, the server may not be running or is not accessible.
echo.
pause
