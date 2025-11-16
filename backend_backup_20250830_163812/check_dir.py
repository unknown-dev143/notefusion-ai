import os

def check_directory():
    print("🔍 Current working directory:")
    print(os.getcwd())
    
    print("\n📂 Directory contents:")
    for item in os.listdir('.'):
        path = os.path.join('.', item)
        print(f"- {item} ({'file' if os.path.isfile(path) else 'dir'})")
    
    print("\n🔍 Checking for database files:")
    for item in os.listdir('.'):
        if item.endswith('.db'):
            path = os.path.join('.', item)
            size = os.path.getsize(path)
            print(f"- {item} ({size} bytes)")

if __name__ == "__main__":
    print("📁 Directory Check")
    print("=" * 50)
    check_directory()
    input("\nPress Enter to exit...")
