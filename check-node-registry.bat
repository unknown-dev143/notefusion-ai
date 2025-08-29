@echo off
echo Checking Node.js installation in registry...

:: Check for Node.js in 64-bit registry
reg query "HKLM\SOFTWARE\Node.js" /s 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Node.js is installed (64-bit)
    reg query "HKLM\SOFTWARE\Node.js" /v "InstallPath" 2>nul
    goto :NODE_FOUND
)

:: Check for Node.js in 32-bit registry
reg query "HKLM\SOFTWARE\WOW6432Node\Node.js" /s 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Node.js is installed (32-bit)
    reg query "HKLM\SOFTWARE\WOW6432Node\Node.js" /v "InstallPath" 2>nul
    goto :NODE_FOUND
)

echo.
echo ❌ Node.js is not installed or not found in registry
echo.
echo Please install Node.js v22.18.0 or later from:
echo https://nodejs.org/
echo.
pause
exit /b 1

:NODE_FOUND
echo.
echo 🔍 Checking Node.js version...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    node --version
) else (
    echo Node.js is installed but not in PATH
)

echo.
pause
