@echo off
echo Starting PWA Update Test...
echo.
echo 1. Starting local server on port 3000
echo 2. Opening browser to test PWA update flow
echo 3. Check the browser console for detailed logs
echo.
start http://localhost:3000/update-test.html
node pwa-test-server.js
echo.
echo Test Instructions:
echo 1. Click "Check for Updates" to see if a new version is available
echo 2. If an update is found, click "Apply Update" to install it
echo 3. The page will reload automatically after update
echo 4. Check the log for update status and version information
pause
