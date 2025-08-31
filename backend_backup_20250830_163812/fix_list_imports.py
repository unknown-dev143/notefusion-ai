"""Script to find and fix missing List imports in Python files."""
import os
import re
import sys
from pathlib import Path

def find_python_files(directory):
    """Find all Python files in the given directory."""
    python_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                python_files.append(os.path.join(root, file))
    return python_files

def fix_list_imports(file_path):
    """Fix List imports in the given file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if file uses List type hints
    if not re.search(r'\bList\[', content) and not re.search(r':\s*List', content):
        return False, "No List type hints found"
    
    # Check if typing is already imported
    if 'from typing import' in content or 'import typing' in content:
        # Check if List is already imported
        if 'from typing import List' in content or 'from typing import' in content and 'List' in content.split('from typing import')[1].split(')')[0]:
            return False, "List already imported from typing"
        
        # Add List to existing typing import
        new_content = content.replace(
            'from typing import', 
            'from typing import List, '
        )
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True, "Added List to existing typing import"
    
    # Add new import if needed
    import_line = 'from typing import List'
    if import_line not in content:
        # Add after the last import or at the top of the file
        import_block = re.findall(r'^(?:from\s+\S+\s+import\s+\S+[\s,]*|import\s+\S+[\s,]*)+', content, re.MULTILINE)
        
        if import_block:
            last_import = import_block[-1]
            new_content = content.replace(last_import, f"{last_import.rstrip()}\n{import_line}\n")
        else:
            # No imports found, add at the top after docstring
            docstring_match = re.match(r'^(\s*"{3}.*?"{3}\s*\n)', content, re.DOTALL)
            if docstring_match:
                new_content = content.replace(
                    docstring_match.group(1), 
                    f"{docstring_match.group(1)}{import_line}\n\n"
                )
            else:
                new_content = f"{import_line}\n\n{content}"
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True, "Added List import"
    
    return False, "No changes needed"

def main():
    """Main function to fix List imports in all Python files."""
    project_dir = os.path.dirname(os.path.abspath(__file__))
    python_files = find_python_files(project_dir)
    
    print(f"Found {len(python_files)} Python files")
    
    fixed_count = 0
    for file_path in python_files:
        try:
            fixed, message = fix_list_imports(file_path)
            if fixed:
                print(f"✅ Fixed {os.path.relpath(file_path, project_dir)}: {message}")
                fixed_count += 1
        except Exception as e:
            print(f"❌ Error processing {os.path.relpath(file_path, project_dir)}: {str(e)}")
    
    print(f"\n✅ Fixed {fixed_count} files")

if __name__ == "__main__":
    main()
