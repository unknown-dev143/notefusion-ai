@echo off
echo Starting PWA Installation Test...
echo.
echo 1. Starting local server on port 3000
echo 2. Opening PWA installation test page
echo 3. Follow the on-screen instructions to test PWA installation

echo.
start http://localhost:3000/install-test.html

node pwa-test-server.js

echo.
echo Test Instructions:
echo 1. Wait for the page to load in your default browser
echo 2. Look for the install button or browser's install prompt
echo 3. If no prompt appears, check the page for installation instructions
echo 4. Test the installed app by closing the browser and launching the PWA

echo.
echo Note: For best results, test in Chrome/Edge and enable "Update on reload" in DevTools

pause
