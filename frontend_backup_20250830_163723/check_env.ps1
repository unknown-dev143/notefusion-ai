Write-Host "Environment Diagnostics:"
Write-Host "====================="

Write-Host "`n1. Checking Node.js Installation:"
Get-Command node -ErrorAction SilentlyContinue
node --version

Write-Host "`n2. Checking npm Installation:"
Get-Command npm -ErrorAction SilentlyContinue
npm --version

Write-Host "`n3. Checking System PATH:"
$env:PATH -split ';' | Where-Object { $_ -ne '' }

Write-Host "`n4. Running a simple Node.js test:"
node -e "console.log('Node.js test successful')"

Write-Host "`n5. Checking directory contents:"
Get-ChildItem -Force

Read-Host -Prompt "`nPress Enter to continue..."
