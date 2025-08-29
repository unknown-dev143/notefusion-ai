import os
import sys

def test_db_access():
    db_path = 'notefusion.db'
    abs_path = os.path.abspath(db_path)
    
    print(f"Testing access to: {abs_path}")
    print("-" * 50)
    
    # Check if file exists
    if not os.path.exists(abs_path):
        print("❌ Database file does not exist!")
        return False
    
    print("✅ Database file exists")
    
    # Check file permissions
    print("\n🔒 Checking file permissions:")
    print(f"Readable: {'✅' if os.access(abs_path, os.R_OK) else '❌'}")
    print(f"Writable: {'✅' if os.access(abs_path, os.W_OK) else '❌'}")
    
    # Try to read the file
    try:
        with open(abs_path, 'rb') as f:
            header = f.read(16)
            print(f"\n📄 File header (hex): {header.hex()}")
            if header.startswith(b'SQLite format 3\000'):
                print("✅ Valid SQLite database header")
                return True
            else:
                print("❌ Not a valid SQLite database")
                return False
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Database Access")
    print("=" * 50)
    if test_db_access():
        print("\n✅ Successfully accessed the database file!")
    else:
        print("\n❌ Failed to access the database file!")
    
    input("\nPress Enter to exit...")
