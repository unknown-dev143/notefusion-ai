Write-Host "=== Environment Verification After Restart ==="
Write-Host "1. Checking Node.js:"
node --version
Write-Host "`n2. Checking npm:"
npm --version
Write-Host "`n3. Verifying project directory:"
Get-ChildItem -Force
Write-Host "`n4. Running a simple test:"
node -e "console.log('Environment test successful')"
Read-Host -Prompt "`nPress Enter to continue..."
