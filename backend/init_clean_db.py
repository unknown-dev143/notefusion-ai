import os
import sqlite3
from datetime import datetime, timedelta
from passlib.hash import bcrypt

def init_db():
    # Create database directory if it doesn't exist
    db_dir = os.path.join(os.path.dirname(__file__), "instance")
    os.makedirs(db_dir, exist_ok=True)
    
    db_path = os.path.join(db_dir, "notefusion_clean.db")
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Create user_sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_token VARCHAR(255) NOT NULL,
        refresh_token VARCHAR(255) NOT NULL,
        user_agent VARCHAR(500),
        ip_address VARCHAR(45),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    
    # Create notes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        is_public BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    
    # Create a test user
    hashed_password = bcrypt.hash("testpassword123")
    cursor.execute(
        """
        INSERT OR IGNORE INTO users (email, hashed_password, full_name, is_active)
        VALUES (?, ?, ?, ?)
        """,
        ("test@example.com", hashed_password, "Test User", 1)
    )
    
    # Commit changes and close connection
    conn.commit()
    
    # Verify tables were created
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("\nTables in the database:")
    for table in tables:
        print(f"- {table[0]}")
    
    # Verify test user was created
    cursor.execute("SELECT email, full_name FROM users WHERE email = ?", ("test@example.com",))
    user = cursor.fetchone()
    if user:
        print("\nTest user created successfully:")
        print(f"Email: {user[0]}")
        print(f"Name: {user[1]}")
    
    conn.close()
    print(f"\nDatabase initialized at: {db_path}")

if __name__ == "__main__":
    init_db()
