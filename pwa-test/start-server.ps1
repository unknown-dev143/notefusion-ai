Write-Host "Starting Python HTTP Server on port 8000"
Write-Host "Open http://localhost:8000 in your browser"
python -m http.server 8000
Read-Host -Prompt "Press Enter to exit"
