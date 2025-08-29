"""Simple backend health check script."""
import os
import sys
from pathlib import Path

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def check_environment():
    """Check required environment variables."""
    required = [
        'DATABASE_URL',
        'SECRET_KEY',
        'JWT_SECRET_KEY',
        'OPENAI_API_KEY'
    ]
    
    print("=== Environment Check ===")
    missing = []
    for var in required:
        if not os.getenv(var):
            missing.append(var)
            print(f"❌ {var} is not set")
        else:
            print(f"✅ {var} is set")
    
    if missing:
        print("\nPlease set the missing environment variables in your .env file")
        return False
    
    print("\n✅ All required environment variables are set")
    return True

def check_database():
    """Check database connection."""
    print("\n=== Database Check ===")
    try:
        import sqlite3
        db_path = 'notefusion.db'
        if not os.path.exists(db_path):
            print(f"❌ Database file not found at {db_path}")
            return False
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        required_tables = ['users', 'notes', 'tasks']
        missing_tables = [t for t in required_tables if t not in tables]
        
        if missing_tables:
            print(f"❌ Missing tables: {', '.join(missing_tables)}")
            return False
        
        print("✅ Database connection successful")
        print(f"✅ Found {len(tables)} tables")
        return True
        
    except Exception as e:
        print(f"❌ Database error: {str(e)}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("\n=== NoteFusion AI Backend Health Check ===\n")
    
    env_ok = check_environment()
    db_ok = check_database()
    
    if env_ok and db_ok:
        print("\n✅ Backend is healthy!")
    else:
        print("\n❌ Backend has issues. Please check the messages above.")
    
    input("\nPress Enter to exit...")
