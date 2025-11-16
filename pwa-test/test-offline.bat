@echo off
echo Starting PWA Test Server for Offline Testing...
echo.
echo 1. Starting local server on port 3000
echo 2. Opening browser to test offline functionality
echo 3. Check the browser console for detailed logs
echo.
start http://localhost:3000/offline-test.html
node pwa-test-server.js
echo.
echo Test Instructions:
echo 1. The page will check network status and cache information
echo 2. Use the buttons to test offline functionality
echo 3. Monitor the log for test results
echo 4. Open DevTools (F12) and go to Application > Service Workers for more details
echo 5. Use the Network tab to simulate offline mode
pause
