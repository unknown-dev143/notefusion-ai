import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.abspath('.'))

# Try to import the database module
try:
    from app.models.database import SessionLocal
    print("✅ Successfully imported database module")
    print(f"Database module path: {SessionLocal}")
except ImportError as e:
    print(f"❌ Error importing database module: {e}")
    print("Current Python path:")
    for path in sys.path:
        print(f"  - {path}")
