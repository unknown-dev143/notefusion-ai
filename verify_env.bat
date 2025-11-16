@echo off
echo ===== Environment Verification =====
echo.

echo 1. Checking Python installation...
where python || echo Python not found in PATH

echo.
echo 2. Running a simple Python command...
python -c "print('Hello from Python!')" || echo Failed to run Python command

echo.
echo 3. Checking Python version...
python --version || echo Could not determine Python version

echo.
pause
