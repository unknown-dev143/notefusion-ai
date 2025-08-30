# Test Node.js environment
Write-Host "=== Node.js Environment Test ==="
Write-Host "Node.js version: $(node -v)"
Write-Host "npm version: $(npm -v)"
Write-Host "Current directory: $(Get-Location)"

# Test basic JavaScript
Write-Host "`nTesting basic JavaScript..."
$jsTest = @"
console.log('JavaScript is working!');
console.log('1 + 1 =', 1 + 1);
"@
$jsTest | Out-File -FilePath "test-script.js" -Encoding utf8
node test-script.js
Remove-Item "test-script.js"

# Test file system access
Write-Host "`nTesting file system access..."
$testContent = "Test content"
$testContent | Out-File -FilePath "test-file.txt" -Encoding utf8
Write-Host "File created with content: $(Get-Content -Path "test-file.txt" -Raw)"
Remove-Item "test-file.txt"

Write-Host "`nEnvironment test completed."
