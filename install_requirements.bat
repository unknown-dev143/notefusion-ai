@echo off
echo Installing required Python packages...
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv alembic
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install packages. Trying with --user flag...
    pip install --user fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv alembic
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Packages installed successfully!
    echo.
    echo To start the server, run:
    echo   uvicorn minimal_app:app --reload
) else (
    echo.
    echo Failed to install packages. Please check your Python installation.
)

pause
