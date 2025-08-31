import sqlite3

def check_tables():
    # Connect to the SQLite database
    conn = sqlite3.connect('notefusion.db')
    cursor = conn.cursor()
    
    # Get the list of tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("Tables in the database:")
    for table in tables:
        print(f"- {table[0]}")
        
        # Get the schema for each table
        cursor.execute(f"PRAGMA table_info({table[0]});")
        columns = cursor.fetchall()
        
        print(f"  Columns in {table[0]}:")
        for column in columns:
            print(f"  - {column[1]} ({column[2]})")
    
    conn.close()

if __name__ == "__main__":
    check_tables()
