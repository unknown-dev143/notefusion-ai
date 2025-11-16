@echo off
echo Starting NoteFusion AI in development mode...

:: Set environment variables
set NODE_ENV=development
set ELECTRON_START_URL=http://localhost:3000

:: Start Vite dev server and Electron
concurrently -k "vite" "wait-on http://localhost:3000 && electron ."
