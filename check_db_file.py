import os
import sys

def check_database_file():
    """Check if the SQLite database file exists and is accessible"""
    db_path = os.path.join(os.path.dirname(__file__), 'backend', 'notefusion.db')
    print(f"🔍 Checking database file: {db_path}")
    
    # Check if file exists
    if not os.path.exists(db_path):
        print("❌ Database file does not exist!")
        print("   Please run database migrations first.")
        return False
    
    # Check file permissions
    try:
        with open(db_path, 'a'):
            pass
        print("✅ Database file exists and is writable")
        return True
    except PermissionError:
        print("❌ Permission denied when trying to write to database file")
        return False
    except Exception as e:
        print(f"❌ Error accessing database file: {str(e)}")
        return False

def main():
    print("🚀 Database File Check\n")
    
    if not check_database_file():
        print("\n❌ Database file check failed.")
        print("   Please ensure the database file exists and is accessible.")
        print("   You may need to run database migrations first.")
        sys.exit(1)
    
    print("\n✅ Database file check completed successfully!")

if __name__ == "__main__":
    main()
