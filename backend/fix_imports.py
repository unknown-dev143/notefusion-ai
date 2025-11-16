import os
import re

# Files to update with their relative imports to fix
FILES_TO_UPDATE = [
    {
        'path': 'auth.py',
        'replacements': [
            (r'from \. import (database, models, schemas)', 'import database\nimport models\nimport schemas'),
            (r'from \.config', 'from config')
        ]
    },
    {
        'path': 'app/schemas/__init__.py',
        'replacements': [
            (r'from \.user', 'from app.schemas.user')
        ]
    },
    {
        'path': 'app/routers/auth.py',
        'replacements': [
            (r'from \.\.models', 'from app.models'),
            (r'from \.\.schemas', 'from app.schemas'),
            (r'from \.\.core', 'from app.core'),
            (r'from \.\.database', 'from database'),
            (r'from \.\.config', 'from config')
        ]
    },
    {
        'path': 'app/database.py',
        'replacements': [
            (r'from \.config', 'from config')
        ]
    },
    {
        'path': 'routers/users.py',
        'replacements': [
            (r'from \.\. import', 'import'),
            (r'from \.\.config', 'from config')
        ]
    },
    {
        'path': 'app/models/user.py',
        'replacements': [
            (r'from \.\.database', 'from database')
        ]
    },
    {
        'path': 'working_server.py',
        'replacements': [
            (r'from \. import', 'import'),
            (r'from \.config', 'from config'),
            (r'from \.database', 'from database')
        ]
    },
    {
        'path': 'app/core/security.py',
        'replacements': [
            (r'from \.\.config', 'from config'),
            (r'from \.\.database', 'from database'),
            (r'from \.\.models', 'from app.models'),
            (r'from \.\.schemas', 'from app.schemas')
        ]
    },
    {
        'path': 'app/core/__init__.py',
        'replacements': [
            (r'from \.security', 'from app.core.security')
        ]
    },
    {
        'path': 'init_admin.py',
        'replacements': [
            (r'from \. import', 'import'),
            (r'from \.config', 'from config')
        ]
    }
]

def fix_imports():
    for file_info in FILES_TO_UPDATE:
        file_path = os.path.join(os.getcwd(), file_info['path'])
        if not os.path.exists(file_path):
            print(f"Skipping {file_path} - file not found")
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for pattern, replacement in file_info['replacements']:
            content = re.sub(pattern, replacement, content)
            
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated imports in {file_path}")
        else:
            print(f"No changes needed for {file_path}")

if __name__ == "__main__":
    fix_imports()
