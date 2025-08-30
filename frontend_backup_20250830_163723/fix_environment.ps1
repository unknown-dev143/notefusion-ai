# Stop any running Node.js processes
taskkill /F /IM node.exe /T 2>$null

# Clean up
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
Remove-Item .vitest -Recurse -Force -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

# Install Vitest and required testing dependencies
Write-Host "Installing testing dependencies..." -ForegroundColor Cyan
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @testing-library/dom @vitejs/plugin-react

# Run tests
Write-Host "Running tests..." -ForegroundColor Cyan
npx vitest run

Read-Host -Prompt "Press Enter to exit"
