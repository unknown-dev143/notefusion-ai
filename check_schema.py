import os
import sqlite3

def check_required_tables(cursor, required_tables):
    """Check if all required tables exist in the database"""
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    existing_tables = {row[0] for row in cursor.fetchall()}
    
    missing_tables = []
    for table in required_tables:
        if table not in existing_tables:
            missing_tables.append(table)
    
    return missing_tables

def check_table_columns(cursor, table_name, required_columns):
    """Check if a table has all required columns"""
    cursor.execute(f"PRAGMA table_info({table_name});")
    existing_columns = {row[1] for row in cursor.fetchall()}
    
    missing_columns = []
    for col in required_columns:
        if col not in existing_columns:
            missing_columns.append(col)
    
    return missing_columns

def main():
    db_path = os.path.join(os.path.dirname(__file__), 'backend', 'notefusion.db')
    print(f"🔍 Checking database schema: {db_path}\n")
    
    # Required tables and their columns
    required_schema = {
        'users': ['id', 'email', 'hashed_password', 'is_active', 'is_superuser'],
        'api_keys': ['id', 'user_id', 'name', 'key_hash', 'scopes', 'rate_limit'],
        'notes': ['id', 'title', 'content', 'owner_id', 'created_at', 'updated_at']
    }
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check for missing tables
        missing_tables = check_required_tables(cursor, required_schema.keys())
        if missing_tables:
            print("❌ Missing tables:")
            for table in missing_tables:
                print(f"   - {table}")
        else:
            print("✅ All required tables exist")
        
        # Check table columns
        for table, columns in required_schema.items():
            missing_columns = check_table_columns(cursor, table, columns)
            if missing_columns:
                print(f"❌ Table '{table}' is missing columns: {', '.join(missing_columns)}")
            else:
                print(f"✅ Table '{table}' has all required columns")
        
        if missing_tables:
            print("\n❗ Please run database migrations to create missing tables.")
        else:
            print("\n✅ Database schema looks good!")
            
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
