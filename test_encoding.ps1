# Test script to check file encoding and content
$filePath = ".\test.html"

# Check if file exists
if (-not (Test-Path $filePath)) {
    Write-Host "Error: File not found at $filePath" -ForegroundColor Red
    exit 1
}

# Get file content with different encodings
Write-Host "`n=== Testing file: $filePath ===" -ForegroundColor Cyan

# Try reading with different encodings
$encodings = @("Default", "UTF8", "Unicode", "UTF32", "ASCII")

foreach ($encoding in $encodings) {
    Write-Host "`n--- Testing with $encoding encoding ---" -ForegroundColor Yellow
    try {
        $content = Get-Content -Path $filePath -Encoding $encoding -ErrorAction Stop
        Write-Host "Successfully read $($content.Count) lines" -ForegroundColor Green
        Write-Host "First 3 lines:"
        $content | Select-Object -First 3 | ForEach-Object { "   $_" }
    }
    catch {
        Write-Host "Error reading with $encoding : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Show file properties
Write-Host "`n--- File Properties ---" -ForegroundColor Yellow
Get-Item $filePath | Format-List *

Write-Host "`nTest complete." -ForegroundColor Green
Read-Host "Press Enter to exit"
