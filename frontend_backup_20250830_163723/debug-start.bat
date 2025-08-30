@echo off
echo Starting debug session...
echo.
echo Node.js Version:
node -v
echo.
echo NPM Version:
npm -v
echo.
echo Current Directory:
cd
echo.
echo Directory Contents:
dir

echo.
echo Starting Vite with debug...
set DEBUG=vite:*
npx vite --debug
