import os
import sys

def test_file_access():
    # Test file paths
    files_to_test = [
        'notefusion.db',
        os.path.join(os.getcwd(), 'notefusion.db'),
        os.path.abspath('notefusion.db')
    ]
    
    print("🔍 Testing file access...")
    print("-" * 40)
    
    for file_path in files_to_test:
        print(f"\nTesting path: {file_path}")
        print(f"Exists: {os.path.exists(file_path)}")
        
        if os.path.exists(file_path):
            try:
                # Try to open the file
                with open(file_path, 'rb') as f:
                    header = f.read(16)
                    print(f"Read {len(header)} bytes")
                    print(f"Header: {header}")
                    if header.startswith(b'SQLite format 3\000'):
                        print("✅ Valid SQLite database header")
                    else:
                        print("⚠️  Not a valid SQLite database")
            except Exception as e:
                print(f"❌ Error reading file: {e}")
        else:
            print("File does not exist")
    
    # Check current working directory
    print("\n📂 Current working directory:", os.getcwd())
    print("📂 Directory contents:")
    try:
        for item in os.listdir('.'):
            print(f"- {item}")
    except Exception as e:
        print(f"Error listing directory: {e}")

if __name__ == "__main__":
    test_file_access()
    input("\nPress Enter to exit...")
