@echo off
echo ===== NoteFusion PWA Deployment =====
echo.

echo 1. Creating dist folder...
if not exist "dist" mkdir dist

:: Copy files to dist
copy simple-test.html dist\index.html >nul
copy simple-sw.js dist\service-worker.js >nul
copy minimal-manifest.json dist\manifest.json >nul
copy vercel.json dist\ >nul

echo 2. Files prepared in dist folder
echo.
echo ===== Next Steps =====
echo 1. Go to https://vercel.com/new
echo 2. Select 'Import Project'
echo 3. Drag and drop the 'dist' folder
echo 4. Click 'Deploy'
echo.
echo OR from command line (if Vercel CLI is installed):
echo 1. cd dist
echo 2. npx vercel --prod
echo.
pause
