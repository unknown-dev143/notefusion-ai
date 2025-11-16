@echo off
echo Checking for Node.js installation...

echo.
echo Checking common installation locations:
if exist "%ProgramFiles%\nodejs\node.exe" (
    echo [FOUND] Node.js in Program Files
    "%ProgramFiles%\nodejs\node.exe" --version
) else (
    echo [NOT FOUND] Node.js in Program Files
)

if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
    echo [FOUND] Node.js in Program Files (x86)
    "%ProgramFiles(x86)%\nodejs\node.exe" --version
) else (
    echo [NOT FOUND] Node.js in Program Files (x86)
)

echo.
echo Checking if node is in PATH:
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [FOUND] Node.js in PATH
    node --version
) else (
    echo [NOT FOUND] Node.js in PATH
)

echo.
echo Checking npm cache directory:
if exist "%APPDATA%\npm" (
    echo [FOUND] npm cache directory: %APPDATA%\npm
) else (
    echo [NOT FOUND] npm cache directory
)

echo.
pause
