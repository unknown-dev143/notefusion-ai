import sqlite3
import os

def setup_user_ai_settings():
    db_path = 'notefusion.db'
    print(f"🔍 Setting up user_ai_settings in: {os.path.abspath(db_path)}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Enable foreign key constraints
        cursor.execute("PRAGMA foreign_keys = ON;")
        
        # Check if user_ai_settings table exists
        cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='user_ai_settings'
        """)
        
        if not cursor.fetchone():
            print("❌ user_ai_settings table does not exist. Creating it...")
            
            # Create user_ai_settings table
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
            
            # Create default settings for existing users
            cursor.execute("SELECT id FROM users;")
            users = cursor.fetchall()
            
            if users:
                print(f"👥 Creating default settings for {len(users)} users...")
                for (user_id,) in users:
                    cursor.execute("""
                        INSERT OR IGNORE INTO user_ai_settings 
                        (user_id, default_model_id, auto_upgrade_models)
                        VALUES (?, (SELECT id FROM ai_models WHERE is_default = 1 LIMIT 1), 1)
                    """, (user_id,))
            
            conn.commit()
            print("✅ Successfully created user_ai_settings table")
        else:
            print("✅ user_ai_settings table already exists")
        
        # Verify the table structure
        print("\n📋 Verifying table structure...")
        cursor.execute("PRAGMA table_info(user_ai_settings)")
        columns = [col[1] for col in cursor.fetchall()]
        print("Table columns:", ", ".join(columns))
        
        # Count records
        cursor.execute("SELECT COUNT(*) FROM user_ai_settings")
        count = cursor.fetchone()[0]
        print(f"Total records: {count}")
        
        # Show sample data
        if count > 0:
            print("\n📋 Sample data:")
            cursor.execute("""
                SELECT uas.id, u.email, am.model_id, uas.auto_upgrade_models
                FROM user_ai_settings uas
                LEFT JOIN users u ON uas.user_id = u.id
                LEFT JOIN ai_models am ON uas.default_model_id = am.id
                LIMIT 5
            """)
            
            print("\nID | Email | Default Model | Auto Upgrade")
            print("-" * 50)
            for row in cursor.fetchall():
                print(f"{row[0]} | {row[1]} | {row[2] or 'None'} | {bool(row[3])}")
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🚀 Setting up User AI Settings")
    print("=" * 50)
    setup_user_ai_settings()
    input("\nPress Enter to exit...")
