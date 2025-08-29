# Script to manage the server process
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('start', 'stop', 'restart', 'status')]
    [string]$Action,
    [int]$Port = 8000
)

# Function to check if port is in use
function Get-PortProcess {
    param([int]$Port)
    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
              Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        return Get-Process -Id $process -ErrorAction SilentlyContinue
    }
    return $null
}

# Function to stop process on port
function Stop-PortProcess {
    param([int]$Port)
    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
              Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process -Force
        Write-Host "Stopped process $process on port $Port" -ForegroundColor Green
    } else {
        Write-Host "No process found on port $Port" -ForegroundColor Yellow
    }
}

# Function to start server
function Start-Server {
    param([int]$Port)
    $process = Get-PortProcess -Port $Port
    if ($process) {
        Write-Host "Port $Port is already in use by process $($process.Id)" -ForegroundColor Red
        return
    }
    
    $env:PYTHONUNBUFFERED = "1"
    $env:PYTHONFAULTHANDLER = "1"
    
    Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port $Port --reload" -WorkingDirectory "$PWD\backend"
    
    # Wait a moment for server to start
    Start-Sleep -Seconds 2
    
    $process = Get-PortProcess -Port $Port
    if ($process) {
        Write-Host "Server started on port $Port (PID: $($process.Id))" -ForegroundColor Green
        Write-Host "API Documentation: http://localhost:$Port/docs" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to start server on port $Port" -ForegroundColor Red
    }
}

# Main script
switch ($Action) {
    'start' { 
        Start-Server -Port $Port
    }
    'stop' { 
        Stop-PortProcess -Port $Port
    }
    'restart' {
        Stop-PortProcess -Port $Port
        Start-Sleep -Seconds 1
        Start-Server -Port $Port
    }
    'status' {
        $process = Get-PortProcess -Port $Port
        if ($process) {
            Write-Host "Server is running on port $Port (PID: $($process.Id))" -ForegroundColor Green
            Write-Host "Process name: $($process.ProcessName)" -ForegroundColor Yellow
            Write-Host "API Documentation: http://localhost:$Port/docs" -ForegroundColor Cyan
        } else {
            Write-Host "No server is running on port $Port" -ForegroundColor Yellow
        }
    }
}
