@echo off
echo Checking for running servers on common ports...
echo.

set PORTS=5000 8000 8080 3000 5001 8001 8081

echo Trying to connect to the following ports:
echo %PORTS%
echo.

for %%p in (%PORTS%) do (
    echo Testing port %%p...
    curl -s -o nul -w "%%{http_code}" -m 1 http://localhost:%%p
    if !errorlevel! equ 0 (
        echo.  Server is responding on port %%p!
        echo    Try opening in browser: http://localhost:%%p
    ) else (
        echo.  No response on port %%p
    )
)

echo.
echo If no ports are responding, the server may not be running.
echo.
pause
