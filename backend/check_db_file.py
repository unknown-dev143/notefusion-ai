import os
import sys

def check_database_file():
    db_path = 'notefusion.db'
    abs_path = os.path.abspath(db_path)
    
    print(f"Checking database file: {abs_path}")
    print("-" * 50)
    
    # Check if file exists
    if not os.path.exists(db_path):
        print("❌ Database file does not exist!")
        return False
    
    print("✅ Database file exists")
    
    # Check file permissions
    print("\n🔍 File permissions:")
    print(f"Readable: {'✅' if os.access(db_path, os.R_OK) else '❌'}")
    print(f"Writable: {'✅' if os.access(db_path, os.W_OK) else '❌'}")
    print(f"Executable: {'✅' if os.access(db_path, os.X_OK) else '❌'}")
    
    # Get file stats
    try:
        stat_info = os.stat(db_path)
        print(f"\n📊 File stats:")
        print(f"Size: {stat_info.st_size} bytes")
        print(f"Created: {stat_info.st_ctime}")
        print(f"Modified: {stat_info.st_mtime}")
    except Exception as e:
        print(f"❌ Could not get file stats: {e}")
        return False
    
    # Try to read the file header
    try:
        with open(db_path, 'rb') as f:
            header = f.read(16)
            print(f"\n🔍 File header (hex): {header.hex()}")
            if header.startswith(b'SQLite format 3\000'):
                print("✅ Valid SQLite database header detected")
            else:
                print("⚠️  File exists but doesn't appear to be a valid SQLite database")
    except Exception as e:
        print(f"❌ Could not read file: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🔍 Database File Check")
    print("=" * 50)
    check_database_file()
