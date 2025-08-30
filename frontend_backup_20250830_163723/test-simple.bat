@echo off
echo Starting simple test...
echo.

echo [1] Testing echo command:
echo Hello World!
echo.

echo [2] Testing basic math:
set /a result=1+1
echo 1 + 1 = %result%
echo.

echo [3] Testing directory listing:
dir /b
echo.

echo [4] Testing Node.js:
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js is installed.
    node -e "console.log('Node.js test successful!')"
) else (
    echo Node.js is NOT installed or not in PATH.
)
echo.

echo Test complete!
pause
