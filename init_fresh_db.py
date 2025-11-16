import os
import sqlite3

def create_fresh_database():
    """Create a fresh SQLite database with the required schema"""
    db_path = os.path.join(os.path.dirname(__file__), 'backend', 'notefusion.db')
    
    # Backup existing database if it exists
    if os.path.exists(db_path):
        backup_path = f"{db_path}.backup"
        print(f"🔧 Backing up existing database to: {backup_path}")
        if os.path.exists(backup_path):
            os.remove(backup_path)
        os.rename(db_path, backup_path)
    
    print("🔧 Creating a fresh database...")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(255) NOT NULL UNIQUE,
            hashed_password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            is_superuser BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Create api_keys table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            key_hash VARCHAR(255) NOT NULL UNIQUE,
            scopes TEXT NOT NULL,
            rate_limit INTEGER DEFAULT 100,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_used_at TIMESTAMP,
            expires_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        
        # Create notes table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            owner_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users (id)
        )
        """)
        
        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_notes_owner_id ON notes(owner_id)")
        
        # Create a test user
        cursor.execute("""
        INSERT INTO users (email, hashed_password, full_name, is_active, is_superuser)
        VALUES (?, ?, ?, ?, ?)
        """, (
            "test@example.com",
            "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # hashed "testpassword"
            "Test User",
            True,
            True
        ))
        
        conn.commit()
        print("✅ Database created successfully!")
        print(f"   Database path: {db_path}")
        print("   Test user created: test@example.com / testpassword")
        
    except Exception as e:
        print(f"❌ Error creating database: {str(e)}")
        if os.path.exists(backup_path):
            print(f"   Restoring backup from: {backup_path}")
            if os.path.exists(db_path):
                os.remove(db_path)
            os.rename(backup_path, db_path)
        return False
    finally:
        if 'conn' in locals():
            conn.close()
    
    return True

def main():
    print("🚀 Database Initialization Tool\n")
    
    if not create_fresh_database():
        print("\n❌ Failed to initialize database.")
        return
    
    print("\n✅ Database initialization completed successfully!")
    print("   You can now start the application with the new database.")

if __name__ == "__main__":
    main()
