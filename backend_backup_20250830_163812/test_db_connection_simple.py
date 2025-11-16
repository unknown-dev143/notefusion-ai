import sqlite3
import os

def test_connection():
    db_path = 'notefusion.db'
    print(f"Testing connection to: {os.path.abspath(db_path)}")
    
    # Check if file exists
    if not os.path.exists(db_path):
        print("❌ Database file does not exist!")
        return False
    
    try:
        # Try to connect
        conn = sqlite3.connect(db_path)
        print("✅ Successfully connected to the database")
        
        # Try a simple query
        cursor = conn.cursor()
        cursor.execute("SELECT sqlite_version()")
        version = cursor.fetchone()[0]
        print(f"📊 SQLite version: {version}")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ SQLite error: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()
            print("🔌 Connection closed")

if __name__ == "__main__":
    test_connection()
