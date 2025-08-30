import sqlite3
import os

def run_sql_script(db_path, script_path):
    print(f"Running SQL script: {script_path}")
    print(f"Database: {os.path.abspath(db_path)}")
    
    if not os.path.exists(db_path):
        print(f"❌ Database file not found: {db_path}")
        return False
        
    if not os.path.exists(script_path):
        print(f"❌ SQL script not found: {script_path}")
        return False
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # For better column access
        cursor = conn.cursor()
        
        print("✅ Connected to database")
        
        # Read and execute the SQL script
        with open(script_path, 'r') as file:
            sql_script = file.read()
            
        print("\nExecuting SQL script...")
        cursor.executescript(sql_script)
        
        # Print any results
        while True:
            try:
                rows = cursor.fetchall()
                if rows:
                    for row in rows:
                        print(dict(row) if isinstance(row, sqlite3.Row) else row)
            except sqlite3.ProgrammingError:
                # No more results to fetch
                break
        
        # Commit changes
        conn.commit()
        print("\n✅ SQL script executed successfully")
        return True
        
    except sqlite3.Error as e:
        print(f"❌ SQLite error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()
            print("🔌 Database connection closed")

if __name__ == "__main__":
    db_path = 'notefusion.db'
    script_path = 'create_table_simple.sql'
    
    print(f"Database: {os.path.abspath(db_path)}")
    print(f"SQL Script: {os.path.abspath(script_path)}")
    
    success = run_sql_script(db_path, script_path)
    if success:
        print("\n✅ Table creation completed successfully!")
    else:
        print("\n❌ There were errors during table creation.")
