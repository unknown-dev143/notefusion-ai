import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.abspath('.'))

def main():
    print("\n🔍 Checking Python path:")
    for path in sys.path:
        print(f" - {path}")

    print("\n🔍 Checking imports...")
    
    # Check FastAPI import
    try:
        from fastapi import FastAPI
        print("✅ Successfully imported FastAPI")
    except ImportError as e:
        print(f"❌ Error importing FastAPI: {e}")
        print("\n📦 Checking installed packages:")
        try:
            import pkg_resources
            for d in pkg_resources.working_set:
                print(f" - {d.key}=={d.version}")
        except Exception as e:
            print(f"Could not list installed packages: {e}")
        return
    
    # Check app import
    try:
        from app.main import app
        print("✅ Successfully imported app from app.main")
        print(f"📱 App title: {app.title}")
        print(f"📝 App description: {app.description}")
    except ImportError as e:
        print(f"❌ Error importing app: {e}")
        print("\n📂 Current directory files:")
        for f in os.listdir('.'):
            print(f" - {f}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

    print("\n✅ Check complete")

if __name__ == "__main__":
    main()
