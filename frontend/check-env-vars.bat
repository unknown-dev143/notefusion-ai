@echo off
echo === Environment Variables === > env-vars.txt
echo. >> env-vars.txt
echo PATH: >> env-vars.txt
echo %PATH% >> env-vars.txt
echo. >> env-vars.txt
echo NODE_PATH: %NODE_PATH% >> env-vars.txt
echo. >> env-vars.txt
echo === Node.js Info === >> env-vars.txt
where node >> env-vars.txt 2>&1
node -v >> env-vars.txt 2>&1
echo. >> env-vars.txt
echo === Directory Contents === >> env-vars.txt
dir /b >> env-vars.txt
echo Environment information has been saved to env-vars.txt
