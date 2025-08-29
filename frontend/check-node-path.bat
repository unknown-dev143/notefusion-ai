@echo off
echo Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Node.js is installed at:
    where node
    echo.
    echo Node.js version:
    node -v
) else (
    echo Node.js is not found in PATH.
    echo Please ensure Node.js is installed and added to your system PATH.
)

echo.
pause
