# Check for processes using a specific port
param(
    [Parameter(Mandatory=$true)]
    [int]$Port
)

# Find process using the port
$process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
          Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue

if ($process) {
    Write-Host "Port $Port is in use by process ID: $process" -ForegroundColor Red
    $processInfo = Get-Process -Id $process -ErrorAction SilentlyContinue
    if ($processInfo) {
        Write-Host "Process name: $($processInfo.ProcessName)" -ForegroundColor Yellow
        Write-Host "Process path: $($processInfo.Path)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Port $Port is available." -ForegroundColor Green
}
