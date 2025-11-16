import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_sqlite_connection():
    """Check SQLite database connection"""
    try:
        # Try to connect to SQLite database
        db_path = os.path.join(os.path.dirname(__file__), 'backend', 'notefusion.db')
        engine = create_engine(f'sqlite:///{db_path}')
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
            tables = [row[0] for row in result]
            
        print("✅ SQLite connection successful!")
        print(f"📋 Found {len(tables)} tables: {', '.join(tables)}")
        return True
        
    except Exception as e:
        print(f"❌ SQLite connection failed: {str(e)}")
        return False

def check_postgres_connection():
    """Check PostgreSQL database connection"""
    try:
        # Try to connect to PostgreSQL database
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            print("ℹ️  DATABASE_URL not set in .env file")
            return False
            
        engine = create_engine(db_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.scalar()
            
        print(f"✅ PostgreSQL connection successful!")
        print(f"📋 Database version: {version}")
        return True
        
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {str(e)}")
        return False

def main():
    print("🔍 Testing database connections...\n")
    
    print("1. Checking SQLite database...")
    sqlite_ok = check_sqlite_connection()
    
    print("\n2. Checking PostgreSQL database...")
    postgres_ok = check_postgres_connection()
    
    print("\n📊 Results:")
    print(f"SQLite:     {'✅' if sqlite_ok else '❌'}")
    print(f"PostgreSQL: {'✅' if postgres_ok else '❌'}")
    
    if not (sqlite_ok or postgres_ok):
        print("\n❌ No database connection could be established.")
        print("   Please check your database configuration in .env file.")
    else:
        print("\n✅ Database check completed successfully!")

if __name__ == "__main__":
    main()
