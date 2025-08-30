@echo off
echo Starting test...
cd /d %~dp0
node --version > test-output.txt 2>&1
echo Node version check complete.
pause
