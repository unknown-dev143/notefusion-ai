@echo off
echo ===== Python Environment Check =====
echo.
echo 1. Checking Python in PATH...
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Python found in PATH
    python --version
) else (
    echo Python not found in PATH
)

echo.
echo 2. Checking common Python locations...
if exist "%ProgramFiles%\Python*\python.exe" (
    echo Python found in Program Files
    "%ProgramFiles%\Python*\python.exe" --version
) else (
    echo Python not found in Program Files
)

if exist "%ProgramFiles(x86)%\Python*\python.exe" (
    echo Python found in Program Files (x86)
    "%ProgramFiles(x86)%\Python*\python.exe" --version
) else (
    echo Python not found in Program Files (x86)
)

if exist "%LOCALAPPDATA%\Programs\Python\Python*\python.exe" (
    echo Python found in Local AppData
    "%LOCALAPPDATA%\Programs\Python\Python*\python.exe" --version
) else (
    echo Python not found in Local AppData
)

echo.
pause
