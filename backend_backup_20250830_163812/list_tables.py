import sqlite3
import os

def list_tables():
    db_path = 'notefusion.db'
    print(f"Checking database at: {os.path.abspath(db_path)}")
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # List all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found in the database.")
            return
            
        print("\nTables in the database:")
        for table in tables:
            table_name = table[0]
            print(f"\nTable: {table_name}")
            print("-" * (len(table_name) + 7))
            
            # Get column info
            try:
                cursor.execute(f"PRAGMA table_info({table_name});")
                columns = cursor.fetchall()
                
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
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    list_tables()
