@echo off
echo Starting command test...
echo.

echo [1] Testing basic commands:
echo Hello World
echo.

echo [2] Testing directory listing:
dir /b
echo.

echo [3] Testing environment variables:
echo PATH=%PATH%
echo.

echo [4] Testing Node.js:
where node
echo.
node -v
echo.

echo [5] Creating a test file:
echo Test content > test-file.txt
type test-file.txt
echo.

echo [6] Cleaning up:
del test-file.txt
echo.

echo Test complete!
pause
