import os
import sys
from sqlalchemy import create_engine, text

def test_sqlite_connection():
    """Test SQLite database connection"""
    try:
        # Path to the SQLite database
        db_path = os.path.join(os.path.dirname(__file__), 'backend', 'notefusion.db')
        print(f"🔍 Testing SQLite database at: {db_path}")
        
        # Check if database file exists
        if not os.path.exists(db_path):
            print("❌ Database file does not exist!")
            print("   Please run database migrations first.")
            return False
            
        # Try to connect to the database
        engine = create_engine(f'sqlite:///{db_path}')
        
        with engine.connect() as conn:
            # Check if tables exist
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
            tables = [row[0] for row in result]
            
            if not tables:
                print("❌ No tables found in the database!")
                print("   Please run database migrations.")
                return False
                
            print(f"✅ Successfully connected to SQLite database!")
            print(f"📋 Found {len(tables)} tables: {', '.join(tables)}")
            return True
            
    except Exception as e:
        print(f"❌ Error connecting to SQLite database: {str(e)}")
        return False

def main():
    print("🚀 SQLite Database Connection Test\n")
    
    if not test_sqlite_connection():
        print("\n❌ Database connection test failed.")
        print("   Please check the error message above and ensure:")
        print("   1. The database file exists in the backend directory")
        print("   2. The application has read/write permissions")
        print("   3. The database is not locked by another process")
        sys.exit(1)
    
    print("\n✅ Database connection test completed successfully!")

if __name__ == "__main__":
    main()
