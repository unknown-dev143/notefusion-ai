# Fix HTML files by ensuring they have proper structure

# Define the template with proper HTML5 structure
$template = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{TITLE}}</title>
</head>
<body>
{{BODY}}
</body>
</html>
"@

# Get all HTML files in the current directory and subdirectories
$htmlFiles = Get-ChildItem -Path . -Recurse -Filter "*.html" | Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.git\\' }

$fixedCount = 0
$totalCount = $htmlFiles.Count

Write-Host "Found $totalCount HTML files to process..." -ForegroundColor Cyan

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        
        # Extract title
        $title = "Document"
        if ($content -match '<title[^>]*>([\s\S]*?)</title>') {
            $title = $matches[1].Trim()
        }
        
        # Extract body content
        $bodyContent = $content
        if ($content -match '<body[^>]*>([\s\S]*?)</body>') {
            $bodyContent = $matches[1].Trim()
        }
        
        # Create new content with proper structure
        $newContent = $template -replace '\{\{TITLE\}\}', $title -replace '\{\{BODY\}\}', $bodyContent
        
        # Write the fixed content back to the file
        $newContent | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
        
        Write-Host "✅ Fixed: $($file.FullName)" -ForegroundColor Green
        $fixedCount++
    }
    catch {
        Write-Host "❌ Error processing $($file.FullName): $_" -ForegroundColor Red
    }
}

Write-Host "\n✅ Successfully fixed $fixedCount of $totalCount files" -ForegroundColor Cyan
