import os
import sqlite3

def create_test_database():
    test_db = 'test_notefusion.db'
    print(f"Creating test database: {os.path.abspath(test_db)}")
    
    try:
        # Remove test db if it exists
        if os.path.exists(test_db):
            os.remove(test_db)
            
        # Create new database
        conn = sqlite3.connect(test_db)
        cursor = conn.cursor()
        
        # Create a simple table
        cursor.execute("""
        CREATE TABLE test_table (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            value INTEGER
        )
        """)
        
        # Insert test data
        cursor.execute("INSERT INTO test_table (name, value) VALUES (?, ?)", ("test", 123))
        
        # Verify data
        cursor.execute("SELECT * FROM test_table")
        result = cursor.fetchone()
        
        print(f"✅ Successfully created test database!")
        print(f"Test data: {result}")
        
        # Clean up
        conn.commit()
        conn.close()
        
        # Remove test database
        os.remove(test_db)
        print("✅ Cleaned up test database")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Database Creation")
    print("=" * 50)
    if create_test_database():
        print("\n✅ Test completed successfully!")
    else:
        print("\n❌ Test failed!")
    
    input("\nPress Enter to exit...")
