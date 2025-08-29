Write-Host "Running Python script..."
$output = & python test_python_simple.py 2>&1
Write-Host "Exit Code: $LASTEXITCODE"
Write-Host "Output:"
$output

# Write output to file
$output | Out-File -FilePath "python_output.txt" -Encoding utf8
Write-Host "Output has been written to python_output.txt"

# Keep the window open
Read-Host "Press Enter to continue..."
