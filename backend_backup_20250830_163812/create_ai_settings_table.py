import sqlite3

def create_ai_settings_table():
    try:
        # Connect to the database
        conn = sqlite3.connect('notefusion.db')
        cursor = conn.cursor()
        
        # Check if the table already exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user_ai_settings';
        """)
        
        if cursor.fetchone():
            print("Table 'user_ai_settings' already exists.")
            return
            
        # Create the user_ai_settings table
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
        );
        """)
        
        # Create indexes
        cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_ai_settings_user_id 
        ON user_ai_settings (user_id);
        """)
        
        cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_ai_settings_model_id 
        ON user_ai_settings (default_model_id);
        """)
        
        # Add a trigger for updated_at
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
        cursor.execute("""
        INSERT INTO user_ai_settings (user_id, default_model_id, auto_upgrade_models)
        SELECT id, 
               (SELECT id FROM ai_models WHERE model_id = 'gpt-4' LIMIT 1),
               1
        FROM users
        WHERE id NOT IN (SELECT user_id FROM user_ai_settings);
        """)
        
        conn.commit()
        print("✅ Successfully created user_ai_settings table and set up default settings")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    create_ai_settings_table()
