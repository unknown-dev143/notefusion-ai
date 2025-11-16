"""
Script to manually create the user_tasks table in the SQLite database.
"""
import sqlite3
import uuid
from datetime import datetime

def create_user_tasks_table():
    """Create the user_tasks table if it doesn't exist."""
    db_path = "./notefusion.db"
    
    if not os.path.exists(db_path):
        print("Error: Database file does not exist. Please run init_sqlite.py first.")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create the task_status enum type
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS task_status_enum (
            value TEXT PRIMARY KEY
        );
        """)
        
        # Insert enum values
        cursor.executemany(
            "INSERT OR IGNORE INTO task_status_enum (value) VALUES (?);",
            [('pending',), ('in_progress',), ('completed',), ('cancelled',)]
        )
        
        # Create the task_priority enum type
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS task_priority_enum (
            value TEXT PRIMARY KEY
        );
        """)
        
        # Insert enum values
        cursor.executemany(
            "INSERT OR IGNORE INTO task_priority_enum (value) VALUES (?);",
            [('low',), ('medium',), ('high',)]
        )
        
        # Create the user_tasks table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
            priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
            due_date TIMESTAMP,
            reminder_enabled BOOLEAN NOT NULL DEFAULT 0,
            reminder_time TIMESTAMP,
            category TEXT,
            tags TEXT,  -- Stored as JSON array
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            user_id TEXT NOT NULL,
            FOREIGN KEY (status) REFERENCES task_status_enum (value),
            FOREIGN KEY (priority) REFERENCES task_priority_enum (value),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """)
        
        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks (user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks (status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_tasks_priority ON user_tasks (priority);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_tasks_due_date ON user_tasks (due_date);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_tasks_created_at ON user_tasks (created_at);")
        
        # Commit the changes
        conn.commit()
        conn.close()
        
        print("✅ Successfully created user_tasks table and related objects.")
        return True
        
    except sqlite3.Error as e:
        print(f"❌ SQLite error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    import os
    create_user_tasks_table()
