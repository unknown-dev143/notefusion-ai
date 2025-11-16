import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Try to import the required modules
try:
    from app.main_clean import app
    print("✅ Successfully imported app from main_clean")
    print(f"App title: {app.title}")
except ImportError as e:
    print(f"❌ Error importing: {e}")
    print("\nCurrent Python path:")
    for path in sys.path:
        print(f"- {path}")
    
    print("\nCurrent directory:")
    print(f"- {os.getcwd()}")
    
    print("\nDirectory contents:")
    for item in os.listdir():
        print(f"- {item}")
        
    print("\nApp directory contents:")
    app_dir = os.path.join(os.getcwd(), 'app')
    if os.path.exists(app_dir):
        for item in os.listdir(app_dir):
            print(f"- {item}")
    else:
        print(f"App directory not found at: {app_dir}")
