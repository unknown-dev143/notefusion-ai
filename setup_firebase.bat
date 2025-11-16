@echo off
echo Creating Firebase configuration...

echo # Firebase Configuration > notefusion-vite\.env.local
echo VITE_FIREBASE_API_KEY=your_api_key >> notefusion-vite\.env.local
echo VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com >> notefusion-vite\.env.local
echo VITE_FIREBASE_PROJECT_ID=your_project_id >> notefusion-vite\.env.local
echo VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com >> notefusion-vite\.env.local
echo VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id >> notefusion-vite\.env.local
echo VITE_FIREBASE_APP_ID=your_app_id >> notefusion-vite\.env.local
echo. >> notefusion-vite\.env.local
echo # Update these values with your actual Firebase config from the Firebase Console >> notefusion-vite\.env.local
echo # 1. Go to https://console.firebase.google.com/ >> notefusion-vite\.env.local
echo # 2. Select your project >> notefusion-vite\.env.local
echo # 3. Click the gear icon > Project settings >> notefusion-vite\.env.local
echo # 4. Scroll down to "Your apps" and copy the config values >> notefusion-vite\.env.local

echo Creating Firebase configuration file...
echo import { initializeApp } from 'firebase/app'; > notefusion-vite\src\firebase.ts
echo import { getAuth } from 'firebase/auth'; >> notefusion-vite\src\firebase.ts
echo. >> notefusion-vite\src\firebase.ts
echo const firebaseConfig = { >> notefusion-vite\src\firebase.ts
echo   apiKey: import.meta.env.VITE_FIREBASE_API_KEY, >> notefusion-vite\src\firebase.ts
echo   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, >> notefusion-vite\src\firebase.ts
echo   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, >> notefusion-vite\src\firebase.ts
echo   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, >> notefusion-vite\src\firebase.ts
echo   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, >> notefusion-vite\src\firebase.ts
echo   appId: import.meta.env.VITE_FIREBASE_APP_ID >> notefusion-vite\src\firebase.ts
echo }; >> notefusion-vite\src\firebase.ts
echo. >> notefusion-vite\src\firebase.ts
echo // Initialize Firebase >> notefusion-vite\src\firebase.ts
echo const app = initializeApp(firebaseConfig); >> notefusion-vite\src\firebase.ts
echo const auth = getAuth(app); >> notefusion-vite\src\firebase.ts
echo. >> notefusion-vite\src\firebase.ts
echo export { app, auth }; >> notefusion-vite\src\firebase.ts
echo export default app; >> notefusion-vite\src\firebase.ts

echo.
echo Firebase configuration files have been created!
echo 1. Open notefusion-vite\.env.local
echo 2. Replace the placeholder values with your actual Firebase config
echo 3. Restart your development server if it's running

pause
