@echo off
echo Installing Firebase dependencies...

cd notefusion-vite
npm install firebase @firebase/firestore @firebase/auth

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Dependencies installed successfully!
    echo.
    echo Next steps:
    echo 1. Go to Firebase Console and enable Firestore
    echo 2. Set up security rules (use test mode for development)
    echo 3. Start using the database functions in your components
) else (
    echo.
    echo Error installing dependencies. Please check your internet connection and try again.
)

pause
