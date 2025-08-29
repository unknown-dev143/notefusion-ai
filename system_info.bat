@echo off
echo ===== System Information =====
echo.

echo 1. System Info:
systeminfo | findstr /B /C:"OS Name" /C:"OS Version" /C:"System Type"
echo.

echo 2. Python Executables in PATH:
where python
echo.

echo 3. Environment Variables:
echo PYTHONPATH=%PYTHONPATH%
echo VIRTUAL_ENV=%VIRTUAL_ENV%
echo.

echo 4. Checking Python installations:
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    echo Found Python in Local AppData
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" --version
) else (
    echo Python not found in Local AppData
)

echo.
echo 5. Virtual Environment Check:
if exist "venv\Scripts\python.exe" (
    echo Found Python in venv
    venv\Scripts\python.exe --version
) else (
    echo Python not found in venv
)

echo.
pause
