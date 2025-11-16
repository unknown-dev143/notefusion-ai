# Check if required ports are in use
$ports = @(3001, 9090, 8080)

Write-Host "Checking required ports..." -ForegroundColor Cyan
Write-Host "--------------------------"

$inUse = $false

foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -WarningAction SilentlyContinue
    
    if ($connection.TcpTestSucceeded) {
        Write-Host "❌ Port $port is in use by another application" -ForegroundColor Red
        $inUse = $true
        
        # Try to find which process is using the port
        try {
            $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
                       Select-Object -ExpandProperty OwningProcess -First 1
            if ($process) {
                $processInfo = Get-Process -Id $process -ErrorAction SilentlyContinue
                Write-Host "   Process: $($processInfo.ProcessName) (PID: $process)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   Could not identify the process using port $port" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ Port $port is available" -ForegroundColor Green
    }
}

if ($inUse) {
    Write-Host "\n⚠️  Some required ports are in use. Please stop the applications using these ports and try again." -ForegroundColor Yellow
} else {
    Write-Host "\n✅ All required ports are available" -ForegroundColor Green
}

# Check if Docker is running
Write-Host "\nChecking Docker status..." -ForegroundColor Cyan
Write-Host "------------------------"

try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $dockerVersion" -ForegroundColor Green
        
        # Check if Docker daemon is responding
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker daemon is running" -ForegroundColor Green
        } else {
            Write-Host "❌ Docker daemon is not running" -ForegroundColor Red
            Write-Host "   Please start Docker Desktop and wait for it to be ready" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
