$env:DISABLE_ESLINT_PLUGIN = 'true'
$env:CI = 'false'
$env:SKIP_PREFLIGHT_CHECK = 'true'

Write-Host "Starting build process..."

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install --legacy-peer-deps
}

# Run the build
Write-Host "Running build..."
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build completed successfully!"
} else {
    Write-Host "Build failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}
