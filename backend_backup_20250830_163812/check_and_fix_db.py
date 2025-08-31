import sqlite3
import os

def check_and_fix_database():
    db_path = 'notefusion.db'
    print(f"🔍 Checking database at: {os.path.abspath(db_path)}")
    
    # Check if database exists
    if not os.path.exists(db_path):
        print("❌ Database file not found. Please run database migrations first.")
        return
        
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        print("✅ Connected to the database")
        
        # Check if users table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
        if not cursor.fetchone():
            print("❌ Users table not found. The database schema might be corrupted.")
            return
            
        print("✅ Users table exists")
        
        # Check if ai_models table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ai_models';")
        if not cursor.fetchone():
            print("❌ AI Models table not found. Please run database migrations first.")
            return
            
        print("✅ AI Models table exists")
        
        # Check if user_ai_settings table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_ai_settings';")
        if cursor.fetchone():
            print("✅ user_ai_settings table already exists")
            return
            
        print("\n🛠️  Creating user_ai_settings table...")
        
        # Create the user_ai_settings table
        cursor.execute("""
        CREATE TABLE user_ai_settings (
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
        CREATE INDEX idx_user_ai_settings_user_id 
        ON user_ai_settings (user_id)
        """)
        
        cursor.execute("""
        CREATE INDEX idx_user_ai_settings_model_id 
        ON user_ai_settings (default_model_id)
        """)
        
        # Create trigger for updated_at
        cursor.execute("""
        CREATE TRIGGER update_user_ai_settings_timestamp
        AFTER UPDATE ON user_ai_settings
        FOR EACH ROW
        BEGIN
            UPDATE user_ai_settings 
            SET updated_at = CURRENT_TIMESTAMP 
            WHERE id = OLD.id;
        END;
        """)
        
        # Get the first AI model ID for default settings
        cursor.execute("SELECT id FROM ai_models LIMIT 1;")
        default_model = cursor.fetchone()
        default_model_id = default_model[0] if default_model else None
        
        # Create default settings for existing users
        cursor.execute("SELECT id FROM users;")
        users = cursor.fetchall()
        
        if users and default_model_id:
            print(f"👥 Creating default settings for {len(users)} users...")
            for (user_id,) in users:
                cursor.execute("""
                    INSERT OR IGNORE INTO user_ai_settings 
                    (user_id, default_model_id, auto_upgrade_models)
                    VALUES (?, ?, 1)
                """, (user_id, default_model_id))
                
        conn.commit()
        print("✅ Successfully created user_ai_settings table")
        
        # Verify the table was created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_ai_settings';")
        if cursor.fetchone():
            print("✅ Verification: user_ai_settings table exists")
        else:
            print("❌ Verification failed: user_ai_settings table was not created")
        
    except sqlite3.Error as e:
        print(f"❌ SQLite error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()
            print("\n🔌 Database connection closed")

if __name__ == "__main__":
    print("🚀 Starting database check and fix...\n")
    check_and_fix_database()
    print("\n🏁 Operation completed")
