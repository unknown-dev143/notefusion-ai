# Environment and System Information Script
Write-Host "=== System Information ===" -ForegroundColor Cyan
systeminfo | Select-String -Pattern "OS Name|OS Version|System Type|Total Physical Memory"

Write-Host "`n=== Node.js and npm Information ===" -ForegroundColor Cyan
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
$npmPath = (Get-Command npm -ErrorAction SilentlyContinue).Source

if ($nodePath) {
    Write-Host "Node.js Path: $nodePath"
    Write-Host "Node.js Version: $(node -v)"
} else {
    Write-Host "Node.js is not in PATH" -ForegroundColor Red
}

if ($npmPath) {
    Write-Host "npm Path: $npmPath"
    Write-Host "npm Version: $(npm -v)"
} else {
    Write-Host "npm is not in PATH" -ForegroundColor Red
}

Write-Host "`n=== Environment Variables ===" -ForegroundColor Cyan
$envVars = @("NODE_PATH", "PATH", "NPM_CONFIG_PREFIX", "USERPROFILE")
foreach ($var in $envVars) {
    Write-Host "$($var.PadRight(15)): $($env:$var)"
}

Write-Host "`n=== Disk Space ===" -ForegroundColor Cyan
Get-PSDrive -PSProvider 'FileSystem' | Select-Object Name, @{Name="Free(GB)";Expression={[math]::Round($_.Free / 1GB, 2)}}, @{Name="Total(GB)";Expression={[math]::Round($_.Used / 1GB + $_.Free / 1GB, 2)}} | Format-Table -AutoSize

Write-Host "`n=== Node.js Test ===" -ForegroundColor Cyan
$testFile = Join-Path $PSScriptRoot "node-env-test.txt"
try {
    "Node.js Environment Test`n$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")`nNode.js: $(node -v)`nnpm: $(npm -v)" | Out-File -FilePath $testFile -Force
    $content = Get-Content -Path $testFile -Raw
    Write-Host "Test file created at: $testFile" -ForegroundColor Green
    Write-Host "File content:`n$content"
    Remove-Item -Path $testFile -Force
    Write-Host "Test file removed" -ForegroundColor Green
} catch {
    Write-Host "Error during file test: $_" -ForegroundColor Red
}

Write-Host "`n=== Electron Check ===" -ForegroundColor Cyan
$electronCheck = npm list electron --depth=0 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Electron is installed in the project" -ForegroundColor Green
    $electronCheck | Select-String -Pattern "electron@"
} else {
    Write-Host "Electron is not installed in the project" -ForegroundColor Yellow
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
