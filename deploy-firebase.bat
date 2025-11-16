@echo off
echo ============================
echo NoteFusion AI - Firebase Deploy
echo ============================

:: Check if Node.js and npm are installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

:: Set paths
set "FRONTEND_PATH=notefusion-vite"

:: Install Firebase CLI if not installed
echo.
echo Checking Firebase CLI...
npm list -g firebase-tools || npm install -g firebase-tools

:: Navigate to frontend directory
echo.
echo Setting up frontend...
cd /d "%FRONTEND_PATH%"

:: Install dependencies
echo.
echo Installing dependencies...
npm install

:: Build the application
echo.
echo Building application...
npm run build

:: Deploy to Firebase Hosting
echo.
echo Deploying to Firebase...
firebase login  --no-localhost
firebase init
firebase deploy --only hosting

echo.
echo ============================
echo Deployment complete!
echo ============================
echo.
echo Your app should be live at: https://notefusion-ai.web.app
echo.
echo Next steps:
echo 1. Configure custom domain in Firebase Console if needed
echo 2. Set up Firebase Hosting in production mode
echo 3. Configure security rules for Firestore

echo.
pause
