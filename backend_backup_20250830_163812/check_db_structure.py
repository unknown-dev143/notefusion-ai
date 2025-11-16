import sqlite3

def check_database():
    try:
        # Connect to the database
        conn = sqlite3.connect('notefusion.db')
        cursor = conn.cursor()
        
        # List all tables
        print("\n=== Database Tables ===")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        for table in tables:
            table_name = table[0]
            print(f"\nTable: {table_name}")
            print("-" * (len(table_name) + 8))
            
            # Get table info
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            
            if not columns:
                print("  No columns found")
                continue
                
            for column in columns:
                col_name = column[1]
                col_type = column[2]
                not_null = "NOT NULL" if column[3] else ""
                default = f"DEFAULT {column[4]}" if column[4] is not None else ""
                pk = "PRIMARY KEY" if column[5] else ""
                
                print(f"  {col_name:20} {col_type:15} {not_null:9} {default:15} {pk}")
                
            # Check indexes
            cursor.execute(f"PRAGMA index_list({table_name});")
            indexes = cursor.fetchall()
            
            if indexes:
                print("\n  Indexes:")
                for idx in indexes:
                    idx_name = idx[1]
                    cursor.execute(f"PRAGMA index_info({idx_name});")
                    idx_info = cursor.fetchall()
                    cols = ", ".join([info[2] for info in idx_info])
                    print(f"    {idx_name}: {cols}")
                    
        # Check for triggers
        print("\n=== Triggers ===")
        cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='trigger';")
        triggers = cursor.fetchall()
        
        if not triggers:
            print("No triggers found")
        else:
            for trigger in triggers:
                print(f"\n{trigger[0]}:")
                print(trigger[1])
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    check_database()
