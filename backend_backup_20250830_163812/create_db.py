import os
import sqlite3

def create_database():
    db_path = 'notefusion.db'
    
    # Remove existing database if it exists
    if os.path.exists(db_path):
        os.remove(db_path)
    
    try:
        # Connect to the database (creates it if it doesn't exist)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Enable foreign key constraints
        cursor.execute("PRAGMA foreign_keys = ON;")
        
        # Create users table
        cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            is_superuser BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Create ai_models table
        cursor.execute("""
        CREATE TABLE ai_models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            provider TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            is_default BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
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
        
        # Add default AI models
        default_models = [
            ('gpt-4', 'GPT-4', 'openai', 1, 1),
            ('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'openai', 1, 0),
            ('claude-3-opus', 'Claude 3 Opus', 'anthropic', 1, 0),
            ('claude-3-sonnet', 'Claude 3 Sonnet', 'anthropic', 1, 0)
        ]
        
        cursor.executemany("""
        INSERT INTO ai_models (model_id, name, provider, is_active, is_default)
        VALUES (?, ?, ?, ?, ?)
        """, default_models)
        
        # Create a default admin user
        cursor.execute("""
        INSERT INTO users (email, hashed_password, is_active, is_superuser)
        VALUES (?, ?, 1, 1)
        """, ('admin@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'))  # password: admin123
        
        # Get the admin user ID and default model ID
        admin_id = cursor.lastrowid
        cursor.execute("SELECT id FROM ai_models WHERE is_default = 1 LIMIT 1;")
        default_model_id = cursor.fetchone()[0]
        
        # Create default settings for admin
        cursor.execute("""
        INSERT INTO user_ai_settings (user_id, default_model_id, auto_upgrade_models)
        VALUES (?, ?, 1)
        """, (admin_id, default_model_id))
        
        # Create a trigger for updated_at
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
        
        # Create indexes
        cursor.execute("""
        CREATE INDEX idx_user_ai_settings_user_id 
        ON user_ai_settings (user_id)
        """)
        
        cursor.execute("""
        CREATE INDEX idx_user_ai_settings_model_id 
        ON user_ai_settings (default_model_id)
        """)
        
        # Commit changes
        conn.commit()
        
        print("✅ Database created successfully!")
        print(f"Database path: {os.path.abspath(db_path)}")
        print("\n🔑 Default admin credentials:")
        print("Email: admin@example.com")
        print("Password: admin123 (please change this immediately!)")
        
    except sqlite3.Error as e:
        print(f"❌ Error creating database: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🚀 Creating NoteFusion AI Database")
    print("=" * 50)
    create_database()
    input("\nPress Enter to exit...")
