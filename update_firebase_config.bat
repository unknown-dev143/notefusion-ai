@echo off
echo Updating Firebase configuration...

:: Update .env.local with the provided Firebase config
echo # Firebase Configuration > notefusion-vite\.env.local
echo VITE_FIREBASE_API_KEY=AIzaSyDjjE1f0ltiXWzXeYG0Q0PPgwi6iZeYZ7E >> notefusion-vite\.env.local
echo VITE_FIREBASE_AUTH_DOMAIN=notefusion-ai.firebaseapp.com >> notefusion-vite\.env.local
echo VITE_FIREBASE_PROJECT_ID=notefusion-ai >> notefusion-vite\.env.local
echo VITE_FIREBASE_STORAGE_BUCKET=notefusion-ai.firebasestorage.app >> notefusion-vite\.env.local
echo VITE_FIREBASE_MESSAGING_SENDER_ID=925938525273 >> notefusion-vite\.env.local
echo VITE_FIREBASE_APP_ID=1:925938525273:web:6e379781fafb33193abd48 >> notefusion-vite\.env.local
echo VITE_FIREBASE_MEASUREMENT_ID=G-WLGDBZ59X6 >> notefusion-vite\.env.local

echo Firebase configuration has been updated in notefusion-vite\.env.local
echo Please restart your development server for the changes to take effect.

pause
