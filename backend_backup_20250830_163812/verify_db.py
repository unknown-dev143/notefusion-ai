import sqlite3

def check_tables():
    conn = sqlite3.connect('notefusion.db')
    cursor = conn.cursor()
    
    # Check if tasks table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks';")
    tasks_table = cursor.fetchone()
    
    if tasks_table:
        print("Tasks table exists!")
        
        # Get the schema of the tasks table
        cursor.execute("PRAGMA table_info(tasks);")
        columns = cursor.fetchall()
        
        print("\nTasks table columns:")
        for column in columns:
            print(f"- {column[1]} ({column[2]})")
    else:
        print("Tasks table does not exist!")
        
        # List all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("\nExisting tables:")
        for table in tables:
            print(f"- {table[0]}")
    
    conn.close()

if __name__ == "__main__":
    check_tables()
