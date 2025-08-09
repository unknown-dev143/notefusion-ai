@echo off
echo 🎯 NoteFusion AI - Starting Application...
echo.

REM Check if Python is available
py --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python and try again.
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js and try again.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Install backend dependencies
echo 📦 Installing backend dependencies...
py -m pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo 🚀 Starting NoteFusion AI...
echo.

REM Start backend server
echo Starting backend server...
start "NoteFusion Backend" cmd /k "cd backend && py -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo Starting frontend server...
start "NoteFusion Frontend" cmd /k "cd frontend && npm start"

REM Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo 🎉 NoteFusion AI is starting up!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Documentation: http://localhost:8000/docs
echo.
echo The application will open in your browser shortly...
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open browser
start http://localhost:3000

echo.
echo ✅ Application started successfully!
echo Close the command windows to stop the servers.
echo.
pause 