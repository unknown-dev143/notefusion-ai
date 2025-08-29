import sqlite3
import sys

def create_ai_settings_table():
    try:
        # Connect to the database
        conn = sqlite3.connect('notefusion.db')
        cursor = conn.cursor()
        
        print("🔍 Checking if user_ai_settings table exists...")
        
        # Check if the table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user_ai_settings';
        """)
        
        if cursor.fetchone():
            print("✅ user_ai_settings table already exists")
            return
            
        print("🛠️  Creating user_ai_settings table...")
        
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
        
        # Verify the table was created
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user_ai_settings';
        """)
        
        if cursor.fetchone():
            print("✅ Successfully created user_ai_settings table")
            
            # Check if we have users to create default settings for
            cursor.execute("SELECT id FROM users;")
            users = cursor.fetchall()
            
            if users:
                print(f"👥 Found {len(users)} users, creating default settings...")
                
                # Get a default model ID
                cursor.execute("SELECT id FROM ai_models LIMIT 1;")
                default_model = cursor.fetchone()
                
                if default_model:
                    default_model_id = default_model[0]
                    
                    for user_id, in users:
                        cursor.execute("""
                            INSERT INTO user_ai_settings (user_id, default_model_id, auto_upgrade_models)
                            VALUES (?, ?, 1)
                            ON CONFLICT(user_id) DO NOTHING;
                        """, (user_id, default_model_id))
                    
                    print(f"✅ Created default settings for {len(users)} users")
                else:
                    print("⚠️  No AI models found in the database")
        
        conn.commit()
        
    except sqlite3.Error as e:
        print(f"❌ SQLite error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🚀 Starting user_ai_settings table creation...")
    create_ai_settings_table()
    print("🏁 Script completed")
