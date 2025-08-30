@echo off
echo === Node.js Path Check ===
echo.

echo 1. Checking Node.js in PATH...
where node
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not in PATH.
) else (
    echo Node.js is in PATH.
)

echo.
echo 2. Common Node.js installation locations:
if exist "C:\Program Files\nodejs\node.exe" (
    echo Found in: C:\Program Files\nodejs\node.exe
) else (
    echo Not found: C:\Program Files\nodejs\node.exe
)

if exist "C:\Program Files (x86)\nodejs\node.exe" (
    echo Found in: C:\Program Files (x86)\nodejs\node.exe
) else (
    echo Not found: C:\Program Files (x86)\nodejs\node.exe
)

if exist "%USERPROFILE%\AppData\Roaming\nvm\node.exe" (
    echo Found in: %USERPROFILE%\AppData\Roaming\nvm\node.exe
) else (
    echo Not found: %USERPROFILE%\AppData\Roaming\nvm\node.exe
)

echo.
echo 3. Checking environment variables:
echo PATH=%PATH%
echo.

echo 4. Checking Node.js version:
node --version
if %ERRORLEVEL% NEQ 0 (
    echo Failed to get Node.js version.
) else (
    echo Node.js version: %ERRORLEVEL%
)

echo.
pause
