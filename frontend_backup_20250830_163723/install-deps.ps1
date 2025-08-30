# Install frontend dependencies
Write-Host "Installing frontend dependencies..."
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# Check if installation was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!"
    Write-Host "You can now start the development server with: npm start"
} else {
    Write-Host "Failed to install dependencies. Please check the error messages above." -ForegroundColor Red
}
