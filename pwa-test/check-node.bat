@echo off
echo Checking Node.js and npm installation...

where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Node.js is installed at:
    where node
    echo.
    node -v
) else (
    echo Node.js is not in your PATH
)

echo.
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo npm is installed at:
    where npm
    echo.
    npm -v
) else (
    echo npm is not in your PATH
)

pause
