Write-Host "===== System Information =====" -ForegroundColor Cyan
systeminfo | Select-String -Pattern "OS Name","OS Version"

Write-Host "`n===== Python Information =====" -ForegroundColor Cyan
Write-Host "Python Executable:" (Get-Command python -ErrorAction SilentlyContinue).Source
Write-Host "Python Version:" (python --version 2>&1)

Write-Host "`n===== Environment Variables =====" -ForegroundColor Cyan
Write-Host "PYTHONPATH: $env:PYTHONPATH"
Write-Host "PATH: $env:PATH"

Write-Host "`n===== Python Path =====" -ForegroundColor Cyan
python -c "import sys; print('\n'.join(sys.path))"

Write-Host "`n===== Python Environment =====" -ForegroundColor Cyan
python -c "import sys, os; print(f'Executable: {sys.executable}'); print(f'Version: {sys.version}'); print(f'Prefix: {sys.prefix}'); print(f'Base Prefix: {sys.base_prefix}')"

Write-Host "`n===== Running a simple Python command =====" -ForegroundColor Cyan
python -c "print('Hello from Python!')"

Write-Host "`nEnvironment check complete. Press any key to continue..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
