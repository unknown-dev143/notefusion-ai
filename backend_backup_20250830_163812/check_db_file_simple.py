import os

def main():
    db_path = 'notefusion.db'
    print(f"Checking: {os.path.abspath(db_path)}")
    
    if os.path.exists(db_path):
        print("✅ File exists")
        print(f"Size: {os.path.getsize(db_path)} bytes")
        print(f"Readable: {os.access(db_path, os.R_OK)}")
        print(f"Writable: {os.access(db_path, os.W_OK)}")
    else:
        print("❌ File does not exist")
    
    print("\nCurrent directory contents:")
    for item in os.listdir('.'):
        print(f"- {item} ({'file' if os.path.isfile(item) else 'dir'})")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
