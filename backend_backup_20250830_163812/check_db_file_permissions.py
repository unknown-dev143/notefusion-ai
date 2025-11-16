import os
import sys
import stat

def check_permissions():
    db_path = 'notefusion.db'
    abs_path = os.path.abspath(db_path)
    
    print(f"🔍 Checking: {abs_path}")
    print("-" * 50)
    
    # Check if file exists
    if not os.path.exists(abs_path):
        print("❌ Database file does not exist!")
        return False
    
    print("✅ Database file exists")
    
    # Get file stats
    try:
        st = os.stat(abs_path)
        print(f"\n📊 File stats:")
        print(f"Size: {st.st_size} bytes")
        print(f"Created: {st.st_ctime}")
        print(f"Modified: {st.st_mtime}")
        
        # Check permissions
        print("\n🔒 Permissions:")
        print(f"Readable: {'✅' if os.access(abs_path, os.R_OK) else '❌'}")
        print(f"Writable: {'✅' if os.access(abs_path, os.W_OK) else '❌'}")
        print(f"Executable: {'✅' if os.access(abs_path, os.X_OK) else '❌'}")
        
        # Check if we can open the file
        try:
            with open(abs_path, 'rb') as f:
                header = f.read(16)
                print(f"\n📄 File header: {header.hex()}")
                if header.startswith(b'SQLite format 3\000'):
                    print("✅ Valid SQLite database header")
                    return True
                else:
                    print("❌ Not a valid SQLite database")
                    return False
        except Exception as e:
            print(f"❌ Could not read file: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Error getting file stats: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Database File Check")
    print("=" * 50)
    check_permissions()
    input("\nPress Enter to exit...")
