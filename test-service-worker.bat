@echo off
echo Testing Service Worker Setup
echo ==========================

echo.
echo 1. Verify Service Worker File
echo --------------------------
if exist "frontend\public\sw-offline.js" (
    echo [✓] sw-offline.js exists
) else (
    echo [✗] sw-offline.js is missing!
)

echo.
echo 2. Check Service Worker Registration in index.html
echo -------------------------------------------------
findstr /C:"navigator.serviceWorker.register('/sw-offline.js')" "frontend\public\index.html" >nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] Service Worker registration found in index.html
) else (
    echo [✗] Service Worker registration not found in index.html
)

echo.
echo 3. Check for Required Files
echo --------------------------
set "missing=0"

if exist "frontend\public\offline.html" (
    echo [✓] offline.html exists
) else (
    echo [✗] offline.html is missing!
    set /a missing+=1
)

if exist "frontend\public\offline-icon.svg" (
    echo [✓] offline-icon.svg exists
) else (
    echo [✗] offline-icon.svg is missing!
    set /a missing+=1
)

if exist "frontend\public\manifest-clean.json" (
    echo [✓] manifest-clean.json exists
) else (
    echo [✗] manifest-clean.json is missing!
    set /a missing+=1
)

if %missing% EQU 0 (
    echo [✓] All required files are present
) else (
    echo [✗] %missing% required files are missing
)

echo.
echo 4. Next Steps
echo -------------
echo 1. Start your development server:
echo    cd frontend

echo    npm run dev

echo.
echo 2. Open your browser and visit:
echo    http://localhost:3000/test-service-worker.html

echo.
echo 3. Click "Register Service Worker" and verify the status
echo 4. Test offline functionality using the test page

echo.
pause
