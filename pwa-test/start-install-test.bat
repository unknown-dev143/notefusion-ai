@echo off
echo Starting PWA Install Test...
echo.
echo 1. Starting local server on port 3000
echo 2. Opening browser to test PWA installation
echo 3. Check the browser console for detailed logs
echo.
start http://localhost:3000/install-test.html
node pwa-test-server.js

echo.
echo Test Instructions:
echo 1. The page will check if the app can be installed
echo 2. Look for the install prompt or use the "Trigger Install Prompt" button
echo 3. Monitor the log for installation status
echo 4. Open DevTools (F12) and go to Application > Manifest for PWA details
pause
