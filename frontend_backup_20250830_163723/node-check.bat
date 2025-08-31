@echo off
echo ============================
echo Node.js Environment Check
echo ============================
echo.

echo [1/3] Node.js Information:
where node
node -v

echo.
echo [2/3] npm Information:
where npm
npm -v

echo.
echo [3/3] Environment Path:
echo %PATH%

echo.
echo ============================
echo Check complete. Press any key to exit...
pause >nul
