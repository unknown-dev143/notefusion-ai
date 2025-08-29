@echo off
echo Starting Admin Features Test...
echo.
echo 1. Starting local server on port 3000
echo 2. Opening admin dashboard
echo 3. Simulating user activity...

start http://localhost:3000/admin

node pwa-test-server.js

echo.
echo Test Instructions:
echo 1. Open the admin dashboard in your browser
echo 2. Use the following credentials:
echo    - Username: admin
echo    - Password: admin123
echo 3. Check the following features:
echo    - Total users and active sessions
echo    - Tool usage statistics
echo    - Recent user activity
echo    - User statistics charts

echo.
echo Note: The admin dashboard will show mock data initially.
echo Real user activity will be tracked as users interact with your app.

pause
