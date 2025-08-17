import sqlite3
import os

def check_database():
    db_path = 'notefusion.db'
    print(f"Checking database at: {os.path.abspath(db_path)}")
    
    if not os.path.exists(db_path):
        print("Error: Database file not found!")
        return
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # List all tables
        print("\nTables in the database:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        for table in tables:
            table_name = table[0]
            print(f"\nTable: {table_name}")
            print("-" * (len(table_name) + 7))
            
            # Get table info
            try:
                cursor.execute(f"PRAGMA table_info({table_name});")
                columns = cursor.fetchall()
                
                if not columns:
                    print("  No columns found")
                    continue
                    
                for column in columns:
                    col_id, col_name, col_type, not_null, default_val, is_pk = column
                    print(f"  {col_name:20} {col_type:15} ", end="")
                    if is_pk:
                        print("PRIMARY KEY", end=" ")
                    if not_null:
                        print("NOT NULL", end=" ")
                    if default_val is not None:
                        print(f"DEFAULT {default_val}", end="")
                    print()
            except sqlite3.Error as e:
                print(f"  Error reading table info: {e}")
        
        # Check if user_ai_settings exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_ai_settings';")
        if not cursor.fetchone():
            print("\n❌ user_ai_settings table does not exist")
            
            # Check if we have the required tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
            if not cursor.fetchone():
                print("❌ Users table not found - database may be empty or corrupted")
                return
                
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ai_models';")
            if not cursor.fetchone():
                print("❌ AI Models table not found - database may be empty or corrupted")
                return
                
            print("\n✅ Required tables exist. You can create the user_ai_settings table.")
            print("Run 'python create_ai_settings_table.py' to create it.")
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_database()
