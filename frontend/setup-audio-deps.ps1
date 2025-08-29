# Check and install required npm packages
$requiredPackages = @(
    "react-audio-voice-recorder",
    "react-hot-toast"
)

Write-Host "Checking for required npm packages..."

foreach ($pkg in $requiredPackages) {
    $installed = npm list $pkg --depth=0 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Installing $pkg..."
        npm install $pkg
    } else {
        Write-Host "$pkg is already installed."
    }
}

Write-Host "All dependencies are ready!"
