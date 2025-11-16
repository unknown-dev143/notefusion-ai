@echo off
echo ===== System Information =====
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
echo.

echo ===== Python Information =====
where python
echo.
python --version
echo.

echo ===== Environment Variables =====
echo PYTHONPATH: %PYTHONPATH%
echo PATH: %PATH%
echo.

echo ===== Running a simple Python command =====
python -c "import sys; print(f'Python executable: {sys.executable}'); print(f'Python path: {sys.path}')"
echo.

pause
