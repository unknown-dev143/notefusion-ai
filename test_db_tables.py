import os
import sqlite3

def test_database_tables():
    """Test database connection and list all tables"""
    db_path = os.path.join(os.path.dirname(__file__), 'backend', 'notefusion.db')
    print(f"🔍 Testing database: {db_path}")
    
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get the list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("❌ No tables found in the database!")
            return False
        
        print(f"✅ Found {len(tables)} tables in the database:")
        for i, (table_name,) in enumerate(tables, 1):
            print(f"   {i}. {table_name}")
            
            # Get column info for each table
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            print(f"      Columns: {', '.join(col[1] for col in columns)}")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    print("🚀 Database Tables Check\n")
    
    if not test_database_tables():
        print("\n❌ Database test failed.")
        print("   Please check the error message above.")
        return
    
    print("\n✅ Database test completed successfully!")

if __name__ == "__main__":
    main()
