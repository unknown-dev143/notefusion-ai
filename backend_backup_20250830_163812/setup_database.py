import os
import sqlite3
from datetime import datetime

def setup_database():
    db_path = 'notefusion.db'
    print(f"🔍 Setting up database at: {os.path.abspath(db_path)}")
    
    # Check if database exists
    db_exists = os.path.exists(db_path)
    
    try:
        # Connect to the database (this will create it if it doesn't exist)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        print("✅ Connected to database")
        
        # Enable foreign key constraints
        cursor.execute("PRAGMA foreign_keys = ON;")
        
        # Create users table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            is_superuser BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Create ai_models table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_models (
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
        
        # Create user_ai_settings table if it doesn't exist
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
        
        # Add default AI models if none exist
        cursor.execute("SELECT COUNT(*) FROM ai_models;")
        if cursor.fetchone()[0] == 0:
            print("👾 Adding default AI models...")
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
        
        # Create a default admin user if no users exist
        cursor.execute("SELECT COUNT(*) FROM users;")
        if cursor.fetchone()[0] == 0:
            print("👤 Creating default admin user...")
            # Default password is 'admin123' (you should change this after setup)
            cursor.execute("""
            INSERT INTO users (email, hashed_password, is_active, is_superuser)
            VALUES (?, ?, 1, 1)
            """, ('admin@example.com', 
                  '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'))  # bcrypt hash for 'admin123'
            
            # Get the admin user ID
            admin_id = cursor.lastrowid
            
            # Get the default model ID
            cursor.execute("SELECT id FROM ai_models WHERE is_default = 1 LIMIT 1;")
            default_model_id = cursor.fetchone()[0]
            
            # Create default settings for admin
            cursor.execute("""
            INSERT INTO user_ai_settings (user_id, default_model_id, auto_upgrade_models)
            VALUES (?, ?, 1)
            """, (admin_id, default_model_id))
        
        conn.commit()
        print("✅ Database setup completed successfully!")
        
        # Show summary
        print("\n📊 Database Summary:")
        print("-" * 30)
        
        cursor.execute("SELECT COUNT(*) FROM users;")
        print(f"Users: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM ai_models;")
        print(f"AI Models: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM user_ai_settings;")
        print(f"User AI Settings: {cursor.fetchone()[0]}")
        
        print("\n🔑 Default admin credentials:")
        print("Email: admin@example.com")
        print("Password: admin123 (change this immediately!)")
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        if 'conn' in locals():
            conn.rollback()
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🚀 Starting database setup...")
    setup_database()
    input("\nPress Enter to exit...")
