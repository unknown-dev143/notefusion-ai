"""
Script to initialize SQLite database if it doesn't exist.
"""
import os
import sqlite3

def init_database():
    """Initialize the SQLite database if it doesn't exist."""
    db_path = "./notefusion.db"
    
    # Check if database exists
    if os.path.exists(db_path):
        print(f"Database already exists at: {os.path.abspath(db_path)}")
        return True
    
    print(f"Creating new database at: {os.path.abspath(db_path)}")
    
    try:
        # Create a new database file
        conn = sqlite3.connect(db_path)
        conn.close()
        print("✅ Database created successfully!")
        return True
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

if __name__ == "__main__":
    init_database()
