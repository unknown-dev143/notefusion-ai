@echo off
echo Running Node.js test...
echo.

"C:\nvm4w\nodejs\node.exe" -e "console.log('Node.js version:', process.version); console.log('Current directory:', process.cwd());"

if %ERRORLEVEL% NEQ 0 (
    echo Failed to run Node.js
    pause
    exit /b 1
)

echo.
echo Test completed successfully.
pause
