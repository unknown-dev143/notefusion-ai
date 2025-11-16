@echo off
echo Creating .env.local file...
echo.
echo # API Configuration > notefusion-vite\.env.local
echo VITE_API_URL=http://localhost:8000/api/v1 >> notefusion-vite\.env.local
echo. >> notefusion-vite\.env.local
echo # Firebase Configuration >> notefusion-vite\.env.local
echo VITE_FIREBASE_API_KEY=your_firebase_api_key_here >> notefusion-vite\.env.local
echo VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com >> notefusion-vite\.env.local
echo VITE_FIREBASE_PROJECT_ID=your_project_id >> notefusion-vite\.env.local
echo VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com >> notefusion-vite\.env.local
echo VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id >> notefusion-vite\.env.local
echo VITE_FIREBASE_APP_ID=your_app_id >> notefusion-vite\.env.local
echo VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id >> notefusion-vite\.env.local
echo.
echo .env.local file has been created in the notefusion-vite directory.
echo Please update it with your actual Firebase configuration values.
pause
