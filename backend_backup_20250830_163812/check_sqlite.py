"""
Script to verify SQLite database directly.
"""
import os
import sys
import sqlite3

def check_sqlite():
    """Check SQLite database directly."""
    # Default database path
    db_path = "./notefusion.db"
    
    # Check if the database file exists
    if not os.path.exists(db_path):
        print(f"Database file not found at: {os.path.abspath(db_path)}")
        return
    
    print(f"Found database at: {os.path.abspath(db_path)}")
    
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get the list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found in the database!")
        else:
            print("\nTables in the database:")
            for table in tables:
                table_name = table[0]
                print(f"\nTable: {table_name}")
                
                # Get the table info
                cursor.execute(f"PRAGMA table_info({table_name});")
                columns = cursor.fetchall()
                
                print("  Columns:")
                for column in columns:
                    col_id, col_name, col_type, not_null, default_val, pk = column
                    print(f"    - {col_name}: {col_type} {'PRIMARY KEY' if pk else ''} {'NOT NULL' if not_null else ''} {f'DEFAULT {default_val}' if default_val is not None else ''}")
                
                # Check for indexes
                cursor.execute(f"PRAGMA index_list({table_name});")
                indexes = cursor.fetchall()
                
                if indexes:
                    print("  Indexes:")
                    for index in indexes:
                        idx_id, idx_name, unique = index[0], index[1], bool(index[2])
                        cursor.execute(f"PRAGMA index_info({idx_name});")
                        idx_columns = cursor.fetchall()
                        col_names = [col[2] for col in idx_columns]
                        print(f"    - {idx_name}: {'UNIQUE ' if unique else ''}({', '.join(col_names)})")
        
        # Check if user_tasks table exists
        user_tasks_exists = any(table[0] == 'user_tasks' for table in tables)
        print(f"\n{'✅' if user_tasks_exists else '❌'} user_tasks table exists: {user_tasks_exists}")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_sqlite()
