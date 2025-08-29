$nodeUrl = "https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi"
$outputPath = "$env:TEMP\nodejs_installer.msi"

# Download Node.js installer
Write-Host "Downloading Node.js installer..."
Invoke-WebRequest -Uri $nodeUrl -OutFile $outputPath

# Install Node.js
Write-Host "Installing Node.js..."
Start-Process msiexec.exe -Wait -ArgumentList "/I $outputPath /qn"

# Add Node.js to PATH
$nodePath = "$env:ProgramFiles\nodejs"
$env:Path = "$nodePath;" + $env:Path
[System.Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::User)

# Verify installation
Write-Host "Verifying installation..."
node --version
npm --version

Write-Host "Node.js installation complete! Please restart any open terminals."
