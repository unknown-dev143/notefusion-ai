@echo off
echo Test Batch Script
echo ================
echo Current Directory: %CD%
echo Date: %date%
echo Time: %time%

echo.
echo Environment Variables:
echo --------------------
echo Node: %NODE_HOME%
echo Path: %PATH%

echo.
echo Basic Commands:
echo ----------------
where node
where npm

pause
