@echo off
echo === Starting PWA Development Environment ===
echo.

echo 1. Checking Node.js and npm versions...
node -v
npm -v

echo.
echo 2. Installing dependencies...
npm install express cors

echo.
echo 3. Starting development server...
node server.js

pause
