import os
import sys
import sqlite3

def check_database():
    db_path = 'notefusion.db'
    print(f"🔍 Checking database at: {os.path.abspath(db_path)}")
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if user_ai_settings table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user_ai_settings'
        """)
        
        if not cursor.fetchone():
            print("❌ user_ai_settings table does not exist")
            return False
            
        print("✅ user_ai_settings table exists")
        
        # Check columns
        cursor.execute("PRAGMA table_info(user_ai_settings)")
        columns = [col[1] for col in cursor.fetchall()]
        print("\n📋 Table columns:")
        for col in columns:
            print(f"- {col}")
            
        # Check if there's any data
        cursor.execute("SELECT COUNT(*) FROM user_ai_settings")
        count = cursor.fetchone()[0]
        print(f"\n📊 Total records: {count}")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🔍 Verifying Database Setup")
    print("=" * 50)
    success = check_database()
    print("\n✅ Verification complete!" if success else "\n❌ Verification failed!")
    input("\nPress Enter to exit...")
