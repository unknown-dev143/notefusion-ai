from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

def check_database():
    try:
        # Connect to the database
        DATABASE_URL = "sqlite:///./notefusion_new.db"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        # Create a session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Get table information
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print("\n=== Database Check ===")
        print(f"Database URL: {DATABASE_URL}")
        print("\nTables in database:")
        for table in tables:
            print(f"- {table}")
            print(f"  Columns: {[col['name'] for col in inspector.get_columns(table)]}")
        
        # Check if users table exists and has required columns
        if 'users' in tables:
            print("\nUsers table structure:")
            for column in inspector.get_columns('users'):
                print(f"- {column['name']}: {column['type']}")
        
        # Close the session
        db.close()
        
    except Exception as e:
        print(f"Error checking database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_database()
