@echo off
echo Starting Python HTTP Server on port 8000...
echo Open http://localhost:8000/simple-test.html in your browser
echo.
python -m http.server 8000
pause
