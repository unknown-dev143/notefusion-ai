# Path to the tsconfig.node.json in temp-vite directory
$configPath = "temp-vite/tsconfig.node.json"

# Create the directory if it doesn't exist
$directory = [System.IO.Path]::GetDirectoryName($configPath)
if (-not (Test-Path -Path $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
}

# Create the tsconfig.node.json with proper configuration
$configContent = @'
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["vite.config.ts"]
}
'@

# Write the configuration to file
Set-Content -Path $configPath -Value $configContent -Force

Write-Host "✅ Updated $configPath with proper configuration" -ForegroundColor Green
