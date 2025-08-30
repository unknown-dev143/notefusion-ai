import sqlite3
import os

def test_sqlite():
    db_path = 'notefusion.db'
    print(f"🔍 Checking database at: {os.path.abspath(db_path)}")
    
    # Check if database file exists
    if not os.path.exists(db_path):
        print(f"❌ Database file not found at: {os.path.abspath(db_path)}")
        return
        
    print("✅ Database file exists")
    
    try:
        # Try to connect to the database
        conn = sqlite3.connect(db_path)
        print("✅ Successfully connected to the database")
        
        # Get database version
        cursor = conn.cursor()
        cursor.execute("SELECT sqlite_version()")
        version = cursor.fetchone()[0]
        print(f"📊 SQLite version: {version}")
        
        # List all tables
        print("\n📋 Database tables:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found in the database")
        else:
            for table in tables:
                print(f"- {table[0]}")
        
        # Check if users table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
        if cursor.fetchone():
            print("\n👥 Users table exists")
            
            # Count users
            cursor.execute("SELECT COUNT(*) FROM users;")
            user_count = cursor.fetchone()[0]
            print(f"   Total users: {user_count}")
        else:
            print("\n❌ Users table does not exist")
        
        # Check if ai_models table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ai_models';")
        if cursor.fetchone():
            print("\n🤖 AI Models table exists")
            
            # Count AI models
            cursor.execute("SELECT COUNT(*) FROM ai_models;")
            model_count = cursor.fetchone()[0]
            print(f"   Total AI models: {model_count}")
            
            # List AI models
            cursor.execute("SELECT id, model_id, provider FROM ai_models;")
            models = cursor.fetchall()
            for model in models:
                print(f"   - ID: {model[0]}, Model: {model[1]}, Provider: {model[2]}")
        else:
            print("\n❌ AI Models table does not exist")
        
        # Check if user_ai_settings table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_ai_settings';")
        if cursor.fetchone():
            print("\n⚙️  User AI Settings table exists")
            
            # Count settings
            cursor.execute("SELECT COUNT(*) FROM user_ai_settings;")
            settings_count = cursor.fetchone()[0]
            print(f"   Total settings entries: {settings_count}")
        else:
            print("\n❌ User AI Settings table does not exist")
        
    except sqlite3.Error as e:
        print(f"\n❌ SQLite error: {e}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()
            print("\n🔌 Database connection closed")

if __name__ == "__main__":
    print("🚀 Starting SQLite database test...\n")
    test_sqlite()
    print("\n🏁 Test completed")
