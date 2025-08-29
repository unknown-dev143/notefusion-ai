@echo off
echo Starting PWA Test Server for Background Sync Testing...
echo.
echo 1. Starting local server on port 3000
echo 2. Opening browser to test background sync
echo 3. Check the browser console for detailed logs
echo.
start http://localhost:3000/sync-test.html
node pwa-test-server.js
echo.
echo Test Instructions:
echo 1. Click "Register Background Sync" to enable background sync
echo 2. Add test data and test the sync functionality
echo 3. Use the browser's offline mode to test offline behavior
echo 4. Check the log for sync status and errors
pause
