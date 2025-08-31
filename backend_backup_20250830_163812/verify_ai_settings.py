import sqlite3

def check_ai_settings_table():
    # Connect to the database
    conn = sqlite3.connect('notefusion.db')
    cursor = conn.cursor()
    
    # Check if the table exists
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='user_ai_settings';
    """)
    
    table_exists = cursor.fetchone()
    
    if table_exists:
        print("✅ user_ai_settings table exists")
        
        # Get the table structure
        cursor.execute("PRAGMA table_info(user_ai_settings);")
        columns = cursor.fetchall()
        
        print("\nTable structure:")
        for column in columns:
            print(f"- {column[1]}: {column[2]}")
            
        # Check for any existing records
        cursor.execute("SELECT COUNT(*) FROM user_ai_settings;")
        count = cursor.fetchone()[0]
        print(f"\nTotal records: {count}")
        
        if count > 0:
            print("\nSample record:")
            cursor.execute("SELECT * FROM user_ai_settings LIMIT 1;")
            print(cursor.fetchone())
    else:
        print("❌ user_ai_settings table does not exist")
        
        # List all tables to help with debugging
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print("\nExisting tables:")
        for table in tables:
            print(f"- {table[0]}")
    
    conn.close()

if __name__ == "__main__":
    check_ai_settings_table()
