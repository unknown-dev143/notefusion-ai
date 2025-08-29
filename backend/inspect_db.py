"""Inspect the database schema and tables."""
import sqlite3
from pathlib import Path

def list_tables(db_path):
    """List all tables in the database."""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("\n=== Database Tables ===")
        if tables:
            for table in tables:
                table_name = table[0]
                print(f"\nTable: {table_name}")
                print("-" * (len(table_name) + 7))
                
                # Get table info
                cursor.execute(f"PRAGMA table_info({table_name});")
                columns = cursor.fetchall()
                
                print("Columns:")
                for col in columns:
                    print(f"  {col[1]} ({col[2]}) - {'NOT NULL' if col[3] else 'NULLABLE'}")
        else:
            print("No tables found in the database.")
            
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        if conn:
            conn.close()

def check_required_tables(db_path, required_tables):
    """Check if required tables exist in the database."""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        existing_tables = {row[0].lower() for row in cursor.fetchall()}
        
        print("\n=== Required Tables Check ===")
        missing_tables = []
        for table in required_tables:
            if table.lower() not in existing_tables:
                print(f"❌ Missing table: {table}")
                missing_tables.append(table)
            else:
                print(f"✅ Found table: {table}")
        
        return missing_tables
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return required_tables
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    db_path = "notefusion.db"
    
    if not Path(db_path).exists():
        print(f"Error: Database file '{db_path}' not found.")
    else:
        print(f"Inspecting database: {db_path}")
        list_tables(db_path)
        
        required = ['users', 'notes', 'tasks']
        missing = check_required_tables(db_path, required)
        
        if missing:
            print(f"\n❌ Missing {len(missing)} required tables: {', '.join(missing)}")
        else:
            print("\n✅ All required tables exist")
