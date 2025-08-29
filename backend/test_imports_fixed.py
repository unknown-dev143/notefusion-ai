import sys
import os

# Add the project root to the Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")
print(f"Working directory: {os.getcwd()}")
print(f"Project root: {project_root}")
print("\nPython path:")
for i, path in enumerate(sys.path, 1):
    print(f"{i:2d}. {path}")

print("\nTrying to import database module...")
try:
    from app.models.database import SessionLocal
    print("✅ Successfully imported database module")
    print(f"SessionLocal: {SessionLocal}")
    
    # Try to import moviepy
    print("\nTrying to import moviepy...")
    try:
        import moviepy.editor
        print("✅ Successfully imported moviepy.editor")
        print(f"MoviePy version: {moviepy.__version__}")
    except ImportError as e:
        print(f"❌ Error importing moviepy: {e}")
    
except ImportError as e:
    print(f"❌ Error importing database module: {e}")
    print("\nTroubleshooting steps:")
    print(f"1. Make sure you're running the script from the project root: {project_root}")
    print("2. Check that the app directory exists and has an __init__.py file")
    print("3. Verify that all required packages are installed")
    
    # Check if app directory exists
    app_dir = os.path.join(project_root, 'app')
    print(f"\nChecking if app directory exists: {app_dir}")
    if os.path.exists(app_dir):
        print("✅ app directory exists")
        print("Contents of app directory:")
        for item in os.listdir(app_dir):
            print(f"  - {item}")
    else:
        print("❌ app directory does not exist")
