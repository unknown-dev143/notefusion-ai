@echo off
echo ===================================
echo System and Environment Check
echo ===================================
echo.

echo [1/4] System Information:
systeminfo | findstr /B /C:"OS Name" /C:"OS Version" /C:"System Type"
echo.

echo [2/4] Node.js and npm Versions:
where node
node -v
where npm
npm -v
echo.

echo [3/4] Environment Variables:
echo NODE_PATH: %NODE_PATH%
echo PATH: %PATH%
echo.

echo [4/4] Disk Space:
wmic logicaldisk get caption,freespace,size,volumename
echo.

echo ===================================
echo Check complete. Press any key to exit...
echo ===================================
pause >nul
