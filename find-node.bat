@echo off
echo Searching for Node.js installation...

:: List of common Node.js installation paths
set "NODE_PATHS=(
  "C:\Program Files\nodejs\node.exe"
  "C:\Program Files (x86)\nodejs\node.exe"
  "%APPDATA%\nvm\v22.18.0\node.exe"
  "%LOCALAPPDATA%\nvm\v22.18.0\node.exe"
  "%NVM_HOME%\v22.18.0\node.exe"
  "%USERPROFILE%\AppData\Local\Programs\nodejs\node.exe"
  "%ProgramFiles%\nodejs\node.exe"
  "%ProgramFiles(x86)%\nodejs\node.exe"
)"

set FOUND=0
for %%i in (%NODE_PATHS%) do (
  if exist "%%i" (
    echo Found Node.js at: %%i
    echo Version: 
    "%%i" -v
    set FOUND=1
  )
)

if %FOUND%==0 (
  echo Node.js not found in common locations.
  echo.
  echo Please install Node.js v22.18.0 or later from:
  echo https://nodejs.org/
  echo.
  echo Make sure to check "Add to PATH" during installation.
)

echo.
pause
