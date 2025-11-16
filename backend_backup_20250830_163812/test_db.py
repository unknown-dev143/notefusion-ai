import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Testing database connection and models...")

try:
    # Import SQLAlchemy components
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    # Import database configuration
    from app.config import settings
    
    print(f"\nDatabase URL: {settings.DATABASE_URL}")
    
    # Create a synchronous engine for testing
    engine = create_engine(settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql"))
    
    # Test the connection
    with engine.connect() as conn:
        print("✅ Successfully connected to the database")
    
    # Test model imports
    print("\nTesting model imports...")
    from app.models.task import Task, TaskStatus, TaskType
    print("✅ Successfully imported Task models")
    
    from app.models.database import SessionLocal
    print("✅ Successfully imported SessionLocal")
    
    # Test creating a session
    print("\nTesting database session...")
    Session = sessionmaker(bind=engine)
    with Session() as session:
        print("✅ Successfully created a database session")
        
        # Test querying tasks
        tasks = session.query(Task).limit(5).all()
        print(f"✅ Successfully queried {len(tasks)} tasks")
    
    print("\n✅ All database tests passed!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    
    # Print Python path for debugging
    print("\nPython path:")
    for path in sys.path:
        print(f"  - {path}")
    
    # Print current working directory
    print(f"\nCurrent working directory: {os.getcwd()}")
