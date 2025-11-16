Write-Host "🔍 Checking database..." -ForegroundColor Cyan
Write-Host "`n📂 Current directory: $((Get-Location).Path)"

# Check if SQLite is installed
$sqlitePath = (Get-Command sqlite3 -ErrorAction SilentlyContinue).Source
if (-not $sqlitePath) {
    Write-Host "❌ SQLite3 is not in your PATH. Please install SQLite or add it to your PATH." -ForegroundColor Red
    exit 1
}

$dbPath = "notefusion.db"
$dbFullPath = Join-Path (Get-Location).Path $dbPath

# Check if database file exists
if (-not (Test-Path $dbPath)) {
    Write-Host "❌ Database file not found: $dbFullPath" -ForegroundColor Red
    Write-Host "`nPlease run database migrations first." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database file exists: $dbFullPath" -ForegroundColor Green
Write-Host "`n📋 Database size: $([math]::Round((Get-Item $dbPath).Length / 1KB, 2)) KB"

# Check if file is locked
$fileLocked = $false
try {
    $file = [System.IO.File]::Open($dbPath, 'Open', 'Read', 'None')
    $file.Close()
} catch {
    $fileLocked = $true
    Write-Host "⚠️  Database file appears to be locked by another process" -ForegroundColor Yellow
}

# List all tables
try {
    Write-Host "`n📋 Listing all tables:" -ForegroundColor Cyan
    $tables = & sqlite3 $dbPath ".tables" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw $tables
    }
    $tables
    
    # If no tables found, the database might be corrupt
    if ([string]::IsNullOrWhiteSpace($tables)) {
        Write-Host "ℹ️  No tables found in the database. The database might be empty or corrupted." -ForegroundColor Yellow
    }
    
    # Show schema for each table
    if (-not [string]::IsNullOrWhiteSpace($tables)) {
        Write-Host "`n📋 Database schema:" -ForegroundColor Cyan
        & sqlite3 $dbPath ".schema"
    }
    
    # Show some basic info
    Write-Host "`nℹ️  Database info:" -ForegroundColor Cyan
    & sqlite3 $dbPath "PRAGMA integrity_check;"
    
} catch {
    Write-Host "❌ Error accessing database: $_" -ForegroundColor Red
    
    # Check if file is a valid SQLite database
    $header = [System.IO.File]::ReadAllBytes($dbPath) | Select-Object -First 16
    $headerStr = -join ($header | ForEach-Object { [char]$_ })
    
    if ($headerStr -match "SQLite format 3") {
        Write-Host "ℹ️  File appears to be a valid SQLite database but cannot be accessed." -ForegroundColor Yellow
        Write-Host "   This might be due to corruption or permission issues." -ForegroundColor Yellow
    } else {
        Write-Host "❌ File does not appear to be a valid SQLite database." -ForegroundColor Red
    }
}

Write-Host "`n🏁 Script completed." -ForegroundColor Green
