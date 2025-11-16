# This script will help check the server logs
Write-Host "Checking for running Python processes..."
$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue

if ($pythonProcesses) {
    Write-Host "Found the following Python processes:"
    $pythonProcesses | Format-Table Id, ProcessName, Path -AutoSize
    
    Write-Host "`nTo view logs, you can use the following commands:"
    Write-Host "1. Get-EventLog -LogName Application -Source Python -Newest 10 | Format-List *"
    Write-Host "2. Or check the terminal where the server is running for output"
} else {
    Write-Host "No Python processes found. The server might not be running."
}

Write-Host "`nTo restart the server, run: python -m uvicorn start_server:app --reload"
