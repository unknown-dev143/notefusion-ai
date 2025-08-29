"""
Simple test script to verify database connection and basic functionality.
"""
import asyncio
from pathlib import Path
import sys

# Add the project root to the Python path
project_root = str(Path(__file__).parent.absolute())
sys.path.insert(0, project_root)

from app.core.database import init_db, close_db, engine, Base
from app.models.user import User

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

async def test_database():
    print("🔍 Testing database connection...")
    
    try:
        # 1. Initialize database connection
        await init_db()
        print_success("Connected to database")
        
        # 2. Check if tables exist
        async with engine.begin() as conn:
            tables = await conn.run_sync(
                lambda sync_conn: 
                sync_conn.dialect.get_table_names(sync_conn)
            )
            
        if not tables:
            print_error("No tables found in the database")
            return False
            
        print_success(f"Found {len(tables)} tables: {', '.join(tables)}")
        
        # 3. Test basic CRUD operations on User model
        test_email = "test_db@example.com"
        
        # Clean up any existing test user
        existing_user = await User.get_by_email(test_email)
        if existing_user:
            await existing_user.delete()
            print_success("Cleaned up existing test user")
        
        # Create a test user
        user = User(
            email=test_email,
            username="testdbuser",
            hashed_password="dummy_hash",
            is_verified=True
        )
        await user.save()
        print_success("Created test user")
        
        # Retrieve the user
        retrieved_user = await User.get_by_email(test_email)
        if not retrieved_user:
            print_error("Failed to retrieve test user")
            return False
            
        print_success(f"Retrieved test user: {retrieved_user.email}")
        
        # Clean up
        await retrieved_user.delete()
        print_success("Cleaned up test user")
        
        return True
        
    except Exception as e:
        print_error(f"Database test failed: {str(e)}")
        return False
        
    finally:
        await close_db()

if __name__ == "__main__":
    success = asyncio.run(test_database())
    if success:
        print("\n🎉 Database tests completed successfully!")
    else:
        print("\n❌ Database tests failed!")
    
    input("\nPress Enter to exit...")
