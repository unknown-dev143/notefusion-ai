import os
import sqlite3

def check_database():
    db_path = 'notefusion.db'
    print(f"🔍 Checking database at: {os.path.abspath(db_path)}")
    
    # Check if database file exists
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        print("\nPlease run database migrations first.")
        return
    
    try:
        # Try to connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        print("✅ Successfully connected to the database")
        
        # Get SQLite version
        cursor.execute("SELECT sqlite_version()")
        version = cursor.fetchone()[0]
        print(f"📊 SQLite version: {version}")
        
        # List all tables
        print("\n📋 Database tables:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found in the database.")
            return
            
        for table in tables:
            table_name = table[0]
            print(f"\nTable: {table_name}")
            print("-" * (len(table_name) + 7))
            
            # Get column info
            try:
                cursor.execute(f"PRAGMA table_info({table_name});")
                columns = cursor.fetchall()
                
                for column in columns:
                    col_id, col_name, col_type, not_null, default_val, is_pk = column
                    print(f"  {col_name:20} {col_type:15} ", end="")
                    if is_pk:
                        print("PRIMARY KEY", end=" ")
                    if not_null:
                        print("NOT NULL", end=" ")
                    if default_val is not None:
                        print(f"DEFAULT {default_val}", end="")
                    print()
            except sqlite3.Error as e:
                print(f"  Error reading table info: {e}")
        
        # Check if user_ai_settings exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_ai_settings';")
        if not cursor.fetchone():
            print("\n❌ user_ai_settings table does not exist")
            
            # Check if we have the required tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
            if cursor.fetchone():
                print("✅ Users table exists")
                
                # Create the user_ai_settings table
                try:
                    print("\n🛠️  Creating user_ai_settings table...")
                    cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_ai_settings (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        default_model_id INTEGER,
                        auto_upgrade_models BOOLEAN DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                        FOREIGN KEY (default_model_id) REFERENCES ai_models (id) ON DELETE SET NULL,
                        UNIQUE (user_id)
                    )
                    """)
                    
                    # Create indexes
                    cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_user_ai_settings_user_id 
                    ON user_ai_settings (user_id)
                    """)
                    
                    cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_user_ai_settings_model_id 
                    ON user_ai_settings (default_model_id)
                    """)
                    
                    # Create trigger for updated_at
                    cursor.execute("""
                    CREATE TRIGGER IF NOT EXISTS update_user_ai_settings_timestamp
                    AFTER UPDATE ON user_ai_settings
                    FOR EACH ROW
                    BEGIN
                        UPDATE user_ai_settings 
                        SET updated_at = CURRENT_TIMESTAMP 
                        WHERE id = OLD.id;
                    END;
                    """)
                    
                    # Create default settings for existing users
                    cursor.execute("SELECT id FROM users;")
                    users = cursor.fetchall()
                    
                    if users:
                        print(f"👥 Creating default settings for {len(users)} users...")
                        for (user_id,) in users:
                            cursor.execute("""
                                INSERT OR IGNORE INTO user_ai_settings 
                                (user_id, default_model_id, auto_upgrade_models)
                                VALUES (?, (SELECT id FROM ai_models LIMIT 1), 1)
                            """, (user_id,))
                    
                    conn.commit()
                    print("✅ Successfully created user_ai_settings table")
                    
                except sqlite3.Error as e:
                    print(f"❌ Error creating table: {e}")
                    conn.rollback()
            else:
                print("❌ Users table not found - database may be empty or corrupted")
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_database()
    input("\nPress Enter to exit...")
