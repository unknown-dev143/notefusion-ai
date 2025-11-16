@echo off
setlocal enabledelayedexpansion

echo ============================
echo NoteFusion AI - Production Deploy
echo ============================

:: Check if running as administrator
net session >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Running with administrator privileges
) else (
    echo ERROR: Please run this script as Administrator
    pause
    exit /b 1
)

:: Set environment variables
set "APP_NAME=notefusion-ai"
set "APP_PATH=C:\\www\\%APP_NAME%"
set "VENV_PATH=%APP_PATH%\\venv"
set "FRONTEND_PATH=%APP_PATH%\\notefusion-vite"
set "BACKEND_PATH=%APP_PATH%\\backend"

:: Create directories if they don't exist
if not exist "%APP_PATH%" (
    echo Creating application directory...
    mkdir "%APP_PATH%"
)

:: Clone or update repository
echo.
echo Updating repository...
if exist "%APP_PATH%\.git" (
    cd /d "%APP_PATH%"
    git pull
) else (
    echo ERROR: Git repository not found at %APP_PATH%
    echo Please clone the repository first
    pause
    exit /b 1
)

:: Backend setup
echo.
echo Setting up backend...
cd /d "%BACKEND_PATH%"

:: Create virtual environment if it doesn't exist
if not exist "%VENV_PATH%" (
    echo Creating Python virtual environment...
    python -m venv "%VENV_PATH%"
)

:: Activate virtual environment and install dependencies
call "%VENV_PATH%\\Scripts\\activate.bat"
pip install -r requirements.txt

:: Run database migrations
echo.
echo Running database migrations...
python -m alembic upgrade head

:: Frontend setup
echo.
echo Setting up frontend...
cd /d "%FRONTEND_PATH%"
npm install
npm run build

:: Set up Nginx (if needed)
echo.
echo Setting up Nginx...
if not exist "C:\\nginx" (
    echo Downloading Nginx...
    curl -o nginx.zip https://nginx.org/download/nginx-1.23.3.zip
    tar -xf nginx.zip
    move nginx-1.23.3 C:\\nginx
    rmdir /s /q nginx.zip
)

:: Configure Nginx
echo.
echo Configuring Nginx...
copy /Y "%APP_PATH%\\deploy\\notefusion.nginx.conf" "C:\\nginx\\conf\\"

:: Set up Windows Service for backend
echo.
echo Setting up Windows Service...
nssm install %APP_NAME% "%VENV_PATH%\\Scripts\\python.exe" "%BACKEND_PATH%\\app\\main.py"
nssm set %APP_NAME% AppDirectory "%BACKEND_PATH%"
nssm set %APP_NAME% AppEnvironmentExtra "PYTHONPATH=%BACKEND_PATH%"
net start %APP_NAME%

echo.
echo ============================
echo Deployment complete!
echo ============================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo.
echo Next steps:
echo 1. Configure your domain in Nginx
echo 2. Set up SSL certificates
echo 3. Configure firewall rules
echo 4. Set up monitoring

pause
