# Install required dependencies
Write-Host "Installing Electron development dependencies..." -ForegroundColor Cyan

# Install main Electron dependencies
npm install --save-dev electron electron-builder electron-is-dev electron-notarize

# Install build tools
npm install --save-dev concurrently cross-env wait-on typescript @types/node

# Add required production dependencies
npm install electron-updater electron-log

# Install Vite plugins if not already installed
if (-not (Test-Path "node_modules/vite-plugin-electron")) {
    npm install --save-dev vite-plugin-electron
}

Write-Host "Electron development environment setup complete!" -ForegroundColor Green
Write-Host "You can now run the following commands:" -ForegroundColor Yellow
Write-Host "  npm run electron:dev    - Start Electron in development mode" -ForegroundColor Yellow
Write-Host "  npm run electron:build  - Build the Electron app" -ForegroundColor Yellow
Write-Host "  npm run electron:start - Start the built Electron app" -ForegroundColor Yellow
