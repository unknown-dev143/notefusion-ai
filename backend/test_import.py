import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.abspath('.'))

try:
    from app.main_clean import app
    print("✅ Successfully imported main_clean!")
    print(f"App title: {app.title}")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\nCurrent working directory:", os.getcwd())
    print("\nPython path:")
    for p in sys.path:
        print(f"- {p}")
    
    print("\nDirectory contents:")
    for item in os.listdir('.'):
        print(f"- {item}")
        
    print("\nApp directory contents:")
    app_dir = os.path.join(os.getcwd(), 'app')
    if os.path.exists(app_dir):
        for item in os.listdir(app_dir):
            print(f"- {item}")
