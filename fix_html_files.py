import os
import re
from pathlib import Path

# Common HTML template with proper structure
HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{title}</title>
</head>
<body>
{body_content}
</body>
</html>'''

def fix_html_file(file_path):
    try:
        # Read the original file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title
        title_match = re.search(r'<title[^>]*>(.*?)</title>', content, re.IGNORECASE)
        title = title_match.group(1).strip() if title_match else 'Document'
        
        # Extract body content
        body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL | re.IGNORECASE)
        body_content = body_match.group(1).strip() if body_match else content.strip()
        
        # Create new HTML with proper structure
        new_content = HTML_TEMPLATE.format(
            title=title,
            body_content=body_content
        )
        
        # Write the fixed content back to the file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Fixed: {file_path}")
        return True
    except Exception as e:
        print(f"❌ Error processing {file_path}: {str(e)}")
        return False

def main():
    # Get all HTML files in the project
    html_files = []
    for root, _, files in os.walk('.'):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    # Process each HTML file
    success_count = 0
    total_files = len(html_files)
    
    print(f"Found {total_files} HTML files to process...\n")
    
    for file_path in html_files:
        if fix_html_file(file_path):
            success_count += 1
    
    print(f"\n✅ Successfully fixed {success_count} of {total_files} files")

if __name__ == '__main__':
    main()
