import os
import sys

def test_permissions():
    print("🔍 Testing file system permissions...\n")
    
    # Test current working directory
    cwd = os.getcwd()
    print(f"Current working directory: {cwd}")
    print(f"Directory exists: {os.path.exists(cwd)}")
    print(f"Is directory: {os.path.isdir(cwd)}")
    print(f"Is writable: {os.access(cwd, os.W_OK)}")
    print(f"Is readable: {os.access(cwd, os.R_OK)}")
    
    # Test database file
    db_path = os.path.join(cwd, 'notefusion.db')
    print(f"\nDatabase path: {db_path}")
    print(f"Database exists: {os.path.exists(db_path)}")
    
    if os.path.exists(db_path):
        print(f"Is file: {os.path.isfile(db_path)}")
        print(f"Is writable: {os.access(db_path, os.W_OK)}")
        print(f"Is readable: {os.access(db_path, os.R_OK)}")
        
        # Try to get file size
        try:
            size = os.path.getsize(db_path)
            print(f"Database size: {size} bytes")
        except Exception as e:
            print(f"Error getting file size: {e}")
    
    # Test creating a new file
    test_file = os.path.join(cwd, 'test_permission.txt')
    print(f"\nTesting write permission by creating: {test_file}")
    
    try:
        with open(test_file, 'w') as f:
            f.write("Test write permission")
        print("✅ Successfully created test file")
        
        # Clean up
        try:
            os.remove(test_file)
            print("✅ Successfully removed test file")
        except Exception as e:
            print(f"⚠️  Could not remove test file: {e}")
            
    except Exception as e:
        print(f"❌ Failed to create test file: {e}")
        print("\n💡 Possible solutions:")
        print("1. Run the script as administrator")
        print("2. Check folder permissions")
        print("3. Make sure the file is not open in another program")
        print("4. Try running in a different directory")

if __name__ == "__main__":
    test_permissions()
