@echo off
echo ===== Deploying to Vercel =====
echo.

echo 1. Creating dist folder...
if not exist "dist" mkdir dist

:: Copy necessary files to dist
copy simple-test.html dist\index.html >nul
copy simple-sw.js dist\service-worker.js >nul
copy minimal-manifest.json dist\manifest.json >nul
copy vercel.json dist\ >nul

echo 2. Installing Vercel CLI...
npm install -g vercel

echo.
echo 3. Deploying to Vercel...
echo Please follow the prompts to complete deployment.

cd dist
vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===== Deployment Successful! =====
    echo Your PWA is now live on Vercel!
) else (
    echo.
    echo ===== Deployment Failed =====
    echo Check the error messages above for details.
)

pause
