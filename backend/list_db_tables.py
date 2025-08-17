import sqlite3

def list_tables():
    try:
        conn = sqlite3.connect('notefusion.db')
        cursor = conn.cursor()
        
        # List all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("📋 Database Tables:")
        print("-" * 50)
        for table in tables:
            print(f"\nTable: {table[0]}")
            print("-" * (len(table[0]) + 7))
            
            # Get column info
            try:
                cursor.execute(f"PRAGMA table_info({table[0]});")
                columns = cursor.fetchall()
                
                print("Columns:")
                for col in columns:
                    col_id, col_name, col_type, not_null, default_val, is_pk = col
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
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🔍 Database Schema")
    print("=" * 50)
    list_tables()
    input("\nPress Enter to exit...")
