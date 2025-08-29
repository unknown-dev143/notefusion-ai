@echo off
echo Starting Browser Compatibility Test...
echo.
echo 1. Starting local server on port 3000
echo 2. Opening browser compatibility test page
echo 3. Run tests in different browsers

echo.
start http://localhost:3000/browser-test.html

node pwa-test-server.js

echo.
echo Test Instructions:
echo 1. Open the following browsers:
echo    - Google Chrome
echo    - Mozilla Firefox
echo    - Microsoft Edge
echo    - Safari (if on Mac)
echo
echo 2. In each browser, navigate to:
echo    http://localhost:3000/browser-test.html

echo.
echo 3. Compare test results across browsers
echo 4. Look for any features that show warnings or errors
echo 5. Note any browser-specific issues

pause
