import sqlite3
import sys

def run_sql_script(db_path, script_path):
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Read the SQL script
        with open(script_path, 'r') as file:
            sql_script = file.read()
        
        # Execute the script
        cursor.executescript(sql_script)
        
        # Fetch and print results
        while True:
            try:
                result = cursor.fetchall()
                if result:
                    for row in result:
                        print(row)
            except sqlite3.ProgrammingError:
                # No more results to fetch
                break
        
        # Close the connection
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python run_sql_script.py <database_path> <script_path>")
        sys.exit(1)
    
    db_path = sys.argv[1]
    script_path = sys.argv[2]
    run_sql_script(db_path, script_path)
